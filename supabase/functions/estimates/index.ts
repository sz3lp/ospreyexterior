import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0';
import { corsHeaders } from '../_shared/cors.ts';

interface EstimatePayload {
  customer_id?: string;
  customer_email?: string;
  customer_name?: string;
  service_type: string;
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
  }>;
  notes?: string;
  expires_days?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const hubspotApiKey = Deno.env.get('HUBSPOT_API_KEY') || '';

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  function calculateTotal(lineItems: Array<{ quantity: number; unit_price: number }>): number {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  }

  async function syncEstimateToHubSpot(estimateId: string, customerId: string, amount: number, serviceType: string) {
    if (!hubspotApiKey) return;

    try {
      const { data: customer } = await supabase
        .from('customers')
        .select('hubspot_contact_id')
        .eq('id', customerId)
        .single();

      if (!customer?.hubspot_contact_id) return;

      const dealResponse = await fetch(
        'https://api.hubapi.com/crm/v3/objects/deals',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${hubspotApiKey}`,
          },
          body: JSON.stringify({
            properties: {
              dealname: `Estimate - ${serviceType}`,
              dealstage: 'estimate_sent',
              amount: amount.toString(),
              service_type: serviceType,
            },
            associations: [
              {
                to: { id: customer.hubspot_contact_id },
                types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }],
              },
            ],
          }),
        }
      );

      if (dealResponse.ok) {
        const dealData = await dealResponse.json();
        await supabase
          .from('estimates')
          .update({ hubspot_deal_id: dealData.id })
          .eq('id', estimateId);
      }
    } catch (error) {
      console.error('HubSpot sync error:', error);
    }
  }

  async function generatePDF(estimate: any): Promise<string> {
    return `/api/estimates/${estimate.id}/pdf`;
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json() as EstimatePayload;
      const { customer_id, customer_email, customer_name, service_type, line_items, notes, expires_days = 30 } = body;

      if (!service_type || !line_items || line_items.length === 0) {
        return new Response(
          JSON.stringify({ success: false, message: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let finalCustomerId = customer_id;

      if (!finalCustomerId && customer_email) {
        let { data: existingCustomer } = await supabase
          .from('customers')
          .select('id')
          .eq('email', customer_email)
          .single();

        if (!existingCustomer) {
          const { data: newCustomer, error: customerError } = await supabase
            .from('customers')
            .insert({
              email: customer_email,
              full_name: customer_name || '',
            })
            .select()
            .single();

          if (customerError) throw customerError;
          existingCustomer = newCustomer;
        }

        finalCustomerId = existingCustomer.id;
      }

      if (!finalCustomerId) {
        return new Response(
          JSON.stringify({ success: false, message: 'Customer ID or email required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const amount = calculateTotal(line_items);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expires_days);

      const { data: estimate, error: estimateError } = await supabase
        .from('estimates')
        .insert({
          customer_id: finalCustomerId,
          service_type: service_type,
          amount: amount,
          status: 'pending',
          expires_at: expiresAt.toISOString(),
          notes: notes || null,
        })
        .select()
        .single();

      if (estimateError) throw estimateError;

      await supabase
        .from('estimates')
        .update({
          notes: JSON.stringify({ line_items, original_notes: notes }),
        })
        .eq('id', estimate.id);

      const pdfUrl = await generatePDF({ ...estimate, line_items, customer_name });

      await supabase
        .from('estimates')
        .update({ pdf_url: pdfUrl })
        .eq('id', estimate.id);

      syncEstimateToHubSpot(estimate.id, finalCustomerId, amount, service_type).catch(console.error);

      return new Response(
        JSON.stringify({
          success: true,
          estimate_id: estimate.id,
          amount: amount,
          pdf_url: pdfUrl,
          expires_at: expiresAt.toISOString(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Estimate creation error:', error);
      return new Response(
        JSON.stringify({ success: false, message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  if (req.method === 'GET') {
    const url = new URL(req.url);
    const estimateId = url.searchParams.get('id');
    const customerId = url.searchParams.get('customer_id');

    if (estimateId) {
      const { data: estimate, error } = await supabase
        .from('estimates')
        .select('*, customers(*)')
        .eq('id', estimateId)
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ success: false, message: 'Estimate not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (customerId) {
        const { data: estimates, error } = await supabase
          .from('estimates')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });

        if (error) {
          return new Response(
            JSON.stringify({ success: false, message: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, estimates }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, estimate }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Estimate ID or customer ID required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (req.method === 'PATCH') {
    try {
      const url = new URL(req.url);
      const estimateId = url.searchParams.get('id');
      
      if (!estimateId) {
        return new Response(
          JSON.stringify({ success: false, message: 'Estimate ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const body = await req.json();
      const { status } = body;

      if (!status || !['pending', 'approved', 'rejected', 'expired'].includes(status)) {
        return new Response(
          JSON.stringify({ success: false, message: 'Valid status required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: estimate, error } = await supabase
        .from('estimates')
        .update({ status })
        .eq('id', estimateId)
        .select()
        .single();

      if (error) throw error;

      if (status === 'approved' && estimate.hubspot_deal_id) {
        const { data: job } = await supabase
          .from('jobs')
          .insert({
            customer_id: estimate.customer_id,
            service_type: estimate.service_type,
            estimate_id: estimate.id,
            total_amount: estimate.amount,
            status: 'scheduled',
            hubspot_deal_id: estimate.hubspot_deal_id,
          })
          .select()
          .single();

        if (hubspotApiKey && estimate.hubspot_deal_id) {
          fetch(`https://api.hubapi.com/crm/v3/objects/deals/${estimate.hubspot_deal_id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${hubspotApiKey}`,
            },
            body: JSON.stringify({
              properties: {
                dealstage: 'estimate_approved',
              },
            }),
          }).catch(console.error);
        }
      }

      return new Response(
        JSON.stringify({ success: true, estimate }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Estimate update error:', error);
      return new Response(
        JSON.stringify({ success: false, message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  return new Response(
    JSON.stringify({ success: false, message: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});


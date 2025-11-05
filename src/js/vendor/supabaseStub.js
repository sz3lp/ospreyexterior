export function createClient(url, anonKey, options = {}) {
  if (!url) {
    throw new Error('Supabase URL is required');
  }
  if (!anonKey) {
    throw new Error('Supabase anon key is required');
  }

  const defaultHeaders = {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
  };

  return {
    from(table) {
      if (!table) {
        throw new Error('Table name is required');
      }

      const baseUrl = `${url.replace(/\/$/, '')}/rest/v1/${table}`;

      return {
        insert(rows) {
          const payload = Array.isArray(rows) ? rows : [rows];
          const request = async (selectQuery) => {
            const query = selectQuery ? `?select=${encodeURIComponent(selectQuery)}` : '';
            const response = await fetch(`${baseUrl}${query}`, {
              method: 'POST',
              headers: {
                ...defaultHeaders,
                Prefer: 'return=representation',
              },
              body: JSON.stringify(payload),
            });

            if (!response.ok) {
              const errorText = await response.text();
              return { data: null, error: new Error(errorText || 'Supabase insert failed'), status: response.status };
            }

            const data = await response.json();
            return { data: Array.isArray(data) ? data : [data], error: null, status: response.status };
          };

          return {
            select(columns = '*') {
              return {
                async single() {
                  const { data, error, status } = await request(columns);
                  if (error) {
                    return { data: null, error, status };
                  }
                  const [first] = data || [];
                  if (!first) {
                    return { data: null, error: new Error('No rows returned'), status };
                  }
                  return { data: first, error: null, status };
                },
                async maybeSingle() {
                  const { data, error, status } = await request(columns);
                  const [first] = data || [];
                  return { data: first || null, error, status };
                },
                async then(resolve, reject) {
                  try {
                    const result = await this.single();
                    resolve?.(result);
                  } catch (err) {
                    reject?.(err);
                  }
                },
              };
            },
            async then(resolve, reject) {
              try {
                const result = await request('*');
                resolve?.(result);
              } catch (error) {
                reject?.(error);
              }
            },
          };
        },
      };
    },
  };
}

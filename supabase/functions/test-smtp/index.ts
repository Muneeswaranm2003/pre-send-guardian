import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SmtpTestRequest {
  host: string;
  port: number;
  username: string;
  password: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { host, port, username, password }: SmtpTestRequest = await req.json();

    console.log(`Testing SMTP connection to ${host}:${port} with user ${username}`);

    // Validate inputs
    if (!host || !port || !username || !password) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: host, port, username, and password are required' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine if we should use TLS based on port
    const useTLS = port === 465;
    const useStartTLS = port === 587 || port === 25;

    console.log(`Connection mode: ${useTLS ? 'TLS' : useStartTLS ? 'STARTTLS' : 'Plain'}`);

    // Try to establish a TCP connection to the SMTP server
    let conn: Deno.TcpConn | Deno.TlsConn;
    
    try {
      if (useTLS) {
        // Direct TLS connection for port 465
        conn = await Deno.connectTls({
          hostname: host,
          port: port,
        });
        console.log('TLS connection established');
      } else {
        // Plain TCP connection first
        conn = await Deno.connect({
          hostname: host,
          port: port,
        });
        console.log('TCP connection established');
      }
    } catch (connError: unknown) {
      const errorMessage = connError instanceof Error ? connError.message : String(connError);
      console.error('Connection failed:', errorMessage);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to connect to ${host}:${port}. Please check the host and port.`,
          details: errorMessage
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Helper function to read response
    const readResponse = async (): Promise<string> => {
      const buffer = new Uint8Array(1024);
      const n = await conn.read(buffer);
      if (n === null) return '';
      return decoder.decode(buffer.subarray(0, n));
    };

    // Helper function to send command
    const sendCommand = async (command: string): Promise<string> => {
      await conn.write(encoder.encode(command + '\r\n'));
      return await readResponse();
    };

    try {
      // Read server greeting
      const greeting = await readResponse();
      console.log('Server greeting:', greeting.trim());

      if (!greeting.startsWith('220')) {
        conn.close();
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Server did not return expected greeting',
            details: greeting.trim()
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Send EHLO
      const ehloResponse = await sendCommand(`EHLO test.local`);
      console.log('EHLO response:', ehloResponse.trim());

      if (!ehloResponse.includes('250')) {
        conn.close();
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'EHLO command failed',
            details: ehloResponse.trim()
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check for STARTTLS if needed
      if (useStartTLS && ehloResponse.includes('STARTTLS')) {
        const starttlsResponse = await sendCommand('STARTTLS');
        console.log('STARTTLS response:', starttlsResponse.trim());
        
        if (starttlsResponse.startsWith('220')) {
          // Upgrade to TLS
          conn = await Deno.startTls(conn as Deno.TcpConn, { hostname: host });
          console.log('Upgraded to TLS');
          
          // Send EHLO again after TLS upgrade
          const ehloResponse2 = await sendCommand(`EHLO test.local`);
          console.log('EHLO after TLS:', ehloResponse2.trim());
        }
      }

      // Try AUTH LOGIN
      const authResponse = await sendCommand('AUTH LOGIN');
      console.log('AUTH LOGIN response:', authResponse.trim());

      if (authResponse.startsWith('334')) {
        // Send username (base64 encoded)
        const userResponse = await sendCommand(btoa(username));
        console.log('Username response:', userResponse.trim());

        if (userResponse.startsWith('334')) {
          // Send password (base64 encoded)
          const passResponse = await sendCommand(btoa(password));
          console.log('Password response:', passResponse.trim());

          if (passResponse.startsWith('235')) {
            // Authentication successful!
            await sendCommand('QUIT');
            conn.close();
            
            console.log('SMTP authentication successful!');
            return new Response(
              JSON.stringify({ 
                success: true, 
                message: 'SMTP connection and authentication successful!',
                details: {
                  host,
                  port,
                  encryption: useTLS ? 'TLS' : useStartTLS ? 'STARTTLS' : 'None',
                  authenticated: true
                }
              }),
              { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } else {
            conn.close();
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'Authentication failed. Please check your username and password.',
                details: passResponse.trim()
              }),
              { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else {
          conn.close();
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Username rejected by server',
              details: userResponse.trim()
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        // Try AUTH PLAIN as fallback
        const credentials = btoa(`\0${username}\0${password}`);
        const authPlainResponse = await sendCommand(`AUTH PLAIN ${credentials}`);
        console.log('AUTH PLAIN response:', authPlainResponse.trim());

        if (authPlainResponse.startsWith('235')) {
          await sendCommand('QUIT');
          conn.close();
          
          console.log('SMTP authentication successful (PLAIN)!');
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'SMTP connection and authentication successful!',
              details: {
                host,
                port,
                encryption: useTLS ? 'TLS' : useStartTLS ? 'STARTTLS' : 'None',
                authenticated: true
              }
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          conn.close();
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Authentication failed. Server may not support AUTH LOGIN or AUTH PLAIN.',
              details: authPlainResponse.trim()
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    } catch (smtpError: unknown) {
      const errorMessage = smtpError instanceof Error ? smtpError.message : String(smtpError);
      console.error('SMTP protocol error:', errorMessage);
      try { conn.close(); } catch {}
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'SMTP protocol error',
          details: errorMessage
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error in test-smtp function:', errorMessage);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'An unexpected error occurred',
        details: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

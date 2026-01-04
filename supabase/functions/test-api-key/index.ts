import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApiKeyTestRequest {
  provider: string;
  apiKey: string;
}

async function testSendGrid(apiKey: string): Promise<{ success: boolean; message: string; details?: string }> {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: 'SendGrid API key is valid!',
        details: `Account: ${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Verified',
      };
    } else if (response.status === 401) {
      return { success: false, message: 'Invalid SendGrid API key' };
    } else {
      const error = await response.text();
      return { success: false, message: 'SendGrid API error', details: error };
    }
  } catch (error) {
    return { success: false, message: 'Failed to connect to SendGrid', details: String(error) };
  }
}

async function testMailgun(apiKey: string): Promise<{ success: boolean; message: string; details?: string }> {
  try {
    // Mailgun API key format is usually "key-xxxxx" or just the key
    // We need to check domains to validate the key
    const response = await fetch('https://api.mailgun.net/v3/domains', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(`api:${apiKey}`)}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const domainCount = data.items?.length || 0;
      return {
        success: true,
        message: 'Mailgun API key is valid!',
        details: `${domainCount} domain(s) configured`,
      };
    } else if (response.status === 401) {
      return { success: false, message: 'Invalid Mailgun API key' };
    } else {
      const error = await response.text();
      return { success: false, message: 'Mailgun API error', details: error };
    }
  } catch (error) {
    return { success: false, message: 'Failed to connect to Mailgun', details: String(error) };
  }
}

async function testPostmark(apiKey: string): Promise<{ success: boolean; message: string; details?: string }> {
  try {
    const response = await fetch('https://api.postmarkapp.com/server', {
      method: 'GET',
      headers: {
        'X-Postmark-Server-Token': apiKey,
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: 'Postmark API key is valid!',
        details: `Server: ${data.Name || 'Verified'}`,
      };
    } else if (response.status === 401) {
      return { success: false, message: 'Invalid Postmark API key' };
    } else {
      const error = await response.text();
      return { success: false, message: 'Postmark API error', details: error };
    }
  } catch (error) {
    return { success: false, message: 'Failed to connect to Postmark', details: String(error) };
  }
}

async function testSparkPost(apiKey: string): Promise<{ success: boolean; message: string; details?: string }> {
  try {
    const response = await fetch('https://api.sparkpost.com/api/v1/account', {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: 'SparkPost API key is valid!',
        details: `Company: ${data.results?.company_name || 'Verified'}`,
      };
    } else if (response.status === 401 || response.status === 403) {
      return { success: false, message: 'Invalid SparkPost API key' };
    } else {
      const error = await response.text();
      return { success: false, message: 'SparkPost API error', details: error };
    }
  } catch (error) {
    return { success: false, message: 'Failed to connect to SparkPost', details: String(error) };
  }
}

async function testMailchimp(apiKey: string): Promise<{ success: boolean; message: string; details?: string }> {
  try {
    // Mailchimp Transactional (Mandrill) API
    const response = await fetch('https://mandrillapp.com/api/1.0/users/info.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key: apiKey }),
    });

    const data = await response.json();
    
    if (data.username) {
      return {
        success: true,
        message: 'Mailchimp Transactional API key is valid!',
        details: `Account: ${data.username}`,
      };
    } else if (data.status === 'error') {
      return { success: false, message: data.message || 'Invalid API key' };
    } else {
      return { success: false, message: 'Invalid Mailchimp Transactional API key' };
    }
  } catch (error) {
    return { success: false, message: 'Failed to connect to Mailchimp', details: String(error) };
  }
}

async function testAmazonSES(apiKey: string): Promise<{ success: boolean; message: string; details?: string }> {
  // For SES, we can't easily validate without full AWS credentials
  // Just do a basic format check
  if (apiKey.length >= 16) {
    return {
      success: true,
      message: 'AWS credentials format looks valid',
      details: 'Note: Full SES validation requires AWS SDK with region and secret key',
    };
  }
  return { success: false, message: 'Invalid AWS access key format' };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider, apiKey }: ApiKeyTestRequest = await req.json();

    console.log(`Testing API key for provider: ${provider}`);

    if (!provider || !apiKey) {
      return new Response(
        JSON.stringify({ success: false, message: 'Provider and API key are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result: { success: boolean; message: string; details?: string };

    switch (provider.toLowerCase()) {
      case 'sendgrid':
        result = await testSendGrid(apiKey);
        break;
      case 'mailgun':
        result = await testMailgun(apiKey);
        break;
      case 'postmark':
        result = await testPostmark(apiKey);
        break;
      case 'sparkpost':
        result = await testSparkPost(apiKey);
        break;
      case 'mailchimp':
        result = await testMailchimp(apiKey);
        break;
      case 'ses':
        result = await testAmazonSES(apiKey);
        break;
      case 'other':
        result = {
          success: true,
          message: 'Custom provider - API key saved',
          details: 'Manual verification recommended',
        };
        break;
      default:
        result = { success: false, message: `Unknown provider: ${provider}` };
    }

    console.log(`API key test result for ${provider}:`, result.success ? 'Valid' : 'Invalid');

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error in test-api-key function:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, message: 'An unexpected error occurred', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

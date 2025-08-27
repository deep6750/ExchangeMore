const axios = require('axios');

async function testTwelveDataAPI() {
  const apiKey = '8c01754c71074264b44d9a30925b5a39';
  const baseUrl = 'https://api.twelvedata.com';
  
  console.log('🚀 Testing Twelve Data API...\n');
  
  try {
    // Test 1: Get EUR/USD quote
    console.log('📊 Testing Forex Quote (EUR/USD):');
    console.log('-'.repeat(40));
    
    const quoteResponse = await axios.get(`${baseUrl}/quote`, {
      params: {
        symbol: 'EUR/USD',
        apikey: apiKey,
        format: 'json'
      }
    });
    
    console.log('✅ Success! Response:');
    console.log(JSON.stringify(quoteResponse.data, null, 2));
    console.log('\n');
    
    // Test 2: Get multiple quotes
    console.log('📊 Testing Multiple Forex Quotes:');
    console.log('-'.repeat(40));
    
    const multiQuoteResponse = await axios.get(`${baseUrl}/quote`, {
      params: {
        symbol: 'EUR/USD,GBP/USD,USD/JPY',
        apikey: apiKey,
        format: 'json'
      }
    });
    
    console.log('✅ Success! Response:');
    console.log(JSON.stringify(multiQuoteResponse.data, null, 2));
    console.log('\n');
    
    // Test 3: Get exchange rate
    console.log('💱 Testing Exchange Rate:');
    console.log('-'.repeat(40));
    
    const exchangeResponse = await axios.get(`${baseUrl}/exchange_rate`, {
      params: {
        from: 'EUR',
        to: 'USD',
        apikey: apiKey,
        format: 'json'
      }
    });
    
    console.log('✅ Success! Response:');
    console.log(JSON.stringify(exchangeResponse.data, null, 2));
    console.log('\n');
    
    // Return summary
    return {
      success: true,
      message: 'All API calls completed successfully',
      data: {
        singleQuote: quoteResponse.data,
        multipleQuotes: multiQuoteResponse.data,
        exchangeRate: exchangeResponse.data
      }
    };
    
  } catch (error) {
    console.log('❌ Error occurred:');
    
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Message: ${error.response.statusText}`);
      console.log('Response Data:');
      console.log(JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('Network error - no response received');
      console.log(error.message);
    } else {
      console.log('Request setup error:');
      console.log(error.message);
    }
    
    return {
      success: false,
      error: error.message,
      details: error.response?.data
    };
  }
}

// Run the test
testTwelveDataAPI()
  .then(result => {
    console.log('\n🎉 Test completed!');
    console.log('='.repeat(50));
    if (result.success) {
      console.log('✅ All API calls were successful');
      console.log('📊 The API is working correctly with your key');
    } else {
      console.log('❌ Some API calls failed');
      console.log('🔍 Check the error details above');
    }
  })
  .catch(error => {
    console.log('💥 Unexpected error:', error.message);
  });

module.exports = testTwelveDataAPI;

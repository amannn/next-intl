const {
  helloWorldNapi,
  extractMessagesNapi,
  processMessagesNapi
} = require('../dist/extractor/index.js');

console.log('Testing next-intl-extracted...\n');

// Test 1: Hello World
console.log('1. Testing hello world function:');
try {
  const greeting = helloWorldNapi();
  console.log(`   Result: ${greeting}`);
  console.log('   ✅ Hello world test passed\n');
} catch (error) {
  console.log(`   ❌ Hello world test failed: ${error.message}\n`);
}

// Test 2: Extract Messages
console.log('2. Testing message extraction:');
try {
  const sourceCode = `
    import { useTranslations } from 'next-intl';
    
    function MyComponent() {
      const t = useTranslations();
      return (
        <div>
          <h1>{t('welcome.title')}</h1>
          <p>{t('welcome.description')}</p>
        </div>
      );
    }
  `;

  const messages = extractMessagesNapi(sourceCode);
  console.log(`   Extracted ${messages.length} messages:`);
  messages.forEach((msg, index) => {
    console.log(`   ${index + 1}. ID: ${msg.id}`);
    console.log(`      Default: ${msg.defaultMessage}`);
    if (msg.description) {
      console.log(`      Description: ${msg.description}`);
    }
  });
  console.log('   ✅ Message extraction test passed\n');
} catch (error) {
  console.log(`   ❌ Message extraction test failed: ${error.message}\n`);
}

// Test 3: Process Messages
console.log('3. Testing message processing:');
try {
  const messages = [
    {
      id: 'welcome.title',
      defaultMessage: 'Welcome to our app!',
      description: 'Main welcome message'
    },
    {
      id: 'welcome.description',
      defaultMessage: 'This is a sample application.',
      description: 'Welcome page description'
    }
  ];

  const processed = processMessagesNapi(messages);
  console.log('   Processed messages (JSON):');
  console.log(processed);
  console.log('   ✅ Message processing test passed\n');
} catch (error) {
  console.log(`   ❌ Message processing test failed: ${error.message}\n`);
}

console.log('All tests completed!');

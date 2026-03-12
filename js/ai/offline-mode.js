// js/ai/offline-mode.js - Offline mode response engine
// Provides local responses when API is unavailable

const OfflineMode = (function() {
  // Random facts for offline mode
  const FACTS = [
    "The human brain uses about 20% of the body's total energy.",
    "A day on Venus is longer than a year on Venus.",
    "Honey never spoils. Archaeologists have found 3000-year-old honey that was still edible.",
    "Octopuses have three hearts and blue blood.",
    "The shortest war in history lasted 38-45 minutes between Britain and Zanzibar in 1896.",
    "Bananas are berries, but strawberries aren't.",
    "There are more stars in the universe than grains of sand on all of Earth's beaches.",
    "The Eiffel Tower can be 15 cm taller during hot summer days.",
    "A jiffy is an actual unit of time: 1/100th of a second.",
    "The world's oldest known living tree is over 5,000 years old.",
    "Water can boil and freeze at the same time under the right pressure and temperature.",
    "The Amazon rainforest produces 20% of the world's oxygen.",
    "A group of flamingos is called a 'flamboyance'.",
    "The human eye can distinguish approximately 10 million different colors.",
    "Lightning strikes the Earth about 8 million times per day.",
    "The average human body contains enough carbon to make 900 pencils.",
    "Some metals can explode when they come into contact with water.",
    "The heart of a blue whale is so large that a small child could crawl through its arteries.",
    "A teaspoonful of neutron star would weigh 6 billion tons.",
    "Hawaii moves 7.5cm closer to Alaska every year due to tectonic plates."
  ];

  // Unit conversions
  const CONVERSIONS = {
    length: {
      km: { m: 1000, cm: 100000, mm: 1000000, mi: 0.621371, ft: 3280.84, in: 39370.1, yd: 1093.61 },
      m: { km: 0.001, cm: 100, mm: 1000, mi: 0.000621371, ft: 3.28084, in: 39.3701, yd: 1.09361 },
      cm: { km: 0.00001, m: 0.01, mm: 10, mi: 0.00000621371, ft: 0.0328084, in: 0.393701, yd: 0.0109361 },
      mi: { km: 1.60934, m: 1609.34, cm: 160934, mm: 1609340, ft: 5280, in: 63360, yd: 1760 },
      ft: { km: 0.0003048, m: 0.3048, cm: 30.48, mm: 304.8, mi: 0.000189394, in: 12, yd: 0.333333 },
      in: { km: 0.0000254, m: 0.0254, cm: 2.54, mm: 25.4, mi: 0.0000157828, ft: 0.0833333, yd: 0.0277778 }
    },
    weight: {
      kg: { g: 1000, mg: 1000000, lb: 2.20462, oz: 35.274, ton: 0.00110231 },
      g: { kg: 0.001, mg: 1000, lb: 0.00220462, oz: 0.035274, ton: 0.00000110231 },
      lb: { kg: 0.453592, g: 453.592, mg: 453592, oz: 16, ton: 0.0005 },
      oz: { kg: 0.0283495, g: 28.3495, mg: 28349.5, lb: 0.0625, ton: 0.00003125 }
    },
    temperature: {
      C: { F: (c) => c * 9/5 + 32, K: (c) => c + 273.15 },
      F: { C: (f) => (f - 32) * 5/9, K: (f) => (f - 32) * 5/9 + 273.15 },
      K: { C: (k) => k - 273.15, F: (k) => (k - 273.15) * 9/5 + 32 }
    }
  };

  // Knowledge base - pattern to response mapping
  const KNOWLEDGE_BASE = {
    // Greetings
    'hello': 'Hello! I\'m your AI assistant. I\'m currently in offline mode, but I can still help with basic questions, calculations, conversions, and more!',
    'hi': 'Hi there! I\'m running in offline mode right now. Try asking about facts, math, or unit conversions!',
    'hey': 'Hey! I\'m here in offline mode. What can I help you with?',
    'greetings': 'Greetings! I\'m operating in offline mode. Ask me about facts, math, or unit conversions!',
    
    // Help
    'help': 'I\'m in offline mode. Here\'s what I can help with:\n\n• Facts - Ask for a random fact\n• Math - Calculate expressions like "5 + 3" or "sqrt(16)"\n• Conversions - Try "5 km to miles" or "100 F to C"\n• Date/Time - Ask "what time is it?" or "what date is it?"\n• Weather - Ask "what\'s the weather like?"\n• Just chat - I can have basic conversations!',
    'what can you do': 'In offline mode I can:\n\n• Answer general knowledge questions\n• Do math calculations\n• Convert units (length, weight, temperature)\n• Tell you the time and date\n• Share interesting facts\n• Have basic conversations',
    'commands': 'Available offline commands:\n\n• "fact" or "random fact" - Get a fun fact\n• "time" - Current time\n• "date" - Today\'s date\n• "[number] [operation] [number]" - Calculator\n• "[number] [unit] to [unit]" - Conversion',
    
    // Time and date
    'time': () => `The current time is ${new Date().toLocaleTimeString()}.`,
    'what time is it': () => `The time is ${new Date().toLocaleTimeString()}.`,
    'date': () => `Today is ${new Date().toLocaleDateString()}.`,
    'what date is it': () => `Today is ${new Date().toLocaleDateString()}.`,
    'day': () => `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}.`,
    
    // Facts
    'fact': () => getRandomFact(),
    'facts': () => getRandomFact(),
    'random fact': () => getRandomFact(),
    'tell me a fact': () => getRandomFact(),
    'interesting fact': () => getRandomFact(),
    'did you know': () => getRandomFact(),
    
    // About
    'who are you': 'I\'m the AI Assistant for this New Tab page. Normally I connect to OpenRouter for AI-powered responses, but when offline I provide basic assistance through local features.',
    'what are you': 'I\'m an AI assistant built into this New Tab extension. I can help with questions, calculations, conversions, and more!',
    'your name': 'I\'m the AI Assistant for this New Tab page. You can call me Assistant!',
    
    // Capabilities
    'offline': 'Yes, I\'m currently in offline mode! I can still help with:\n\n• Math calculations\n• Unit conversions\n• Basic facts\n• Time and date\n• General conversation',
    'online': 'I\'m currently in offline mode, but I can switch to online mode when the API is available. I\'ll automatically reconnect!',
    'network error': 'It looks like there was a network issue connecting to the AI service. I\'m using offline mode to continue helping you. The AI will reconnect automatically when the network is available.'
  };

  /**
   * Get a random fact
   * @returns {string} A random fact
   */
  function getRandomFact() {
    const index = Math.floor(Math.random() * FACTS.length);
    return `Did you know? ${FACTS[index]}`;
  }

  /**
   * Match input against knowledge base patterns
   * @param {string} input - User input
   * @returns {Object} Match result with response
   */
  function matchPattern(input) {
    if (!input) return null;
    
    const lowerInput = input.toLowerCase().trim();
    
    // Direct match
    if (KNOWLEDGE_BASE[lowerInput]) {
      const response = KNOWLEDGE_BASE[lowerInput];
      return {
        matched: true,
        response: typeof response === 'function' ? response() : response
      };
    }
    
    // Partial match - check if any key is contained in input
    for (const key in KNOWLEDGE_BASE) {
      if (lowerInput.includes(key) && key.length > 2) {
        const response = KNOWLEDGE_BASE[key];
        return {
          matched: true,
          response: typeof response === 'function' ? response() : response
        };
      }
    }
    
    return { matched: false };
  }

  /**
   * Parse and evaluate a mathematical expression
   * @param {string} input - Math expression
   * @returns {string} Result or null if invalid
   */
  function parseMath(input) {
    // Basic math operations
    const mathPatterns = [
      /^(\d+\.?\d*)\s*[\+\-\*\/]\s*(\d+\.?\d*)$/, // Basic: 5+3, 10*2
      /^(\d+\.?\d*)\s*[\+\-\*\/]\s*(\d+\.?\d*)\s*[\+\-\*\/]\s*(\d+\.?\d*)$/, // Chain: 5+3*2
      /^sqrt\((\d+\.?\d*)\)$/, // sqrt(16)
      /^(\d+\.?\d*)\s*\^(\d+)$/, // 2^8
      /^(\d+)\s*%\s*(\d+)$/, // 50% of 100
      /^(.+?)\s*(mod|modulo)\s*(.+)$/ // mod: 10 mod 3
    ];
    
    let result = null;
    
    // Basic addition, subtraction, multiplication, division
    let match = input.match(/^(-?\d+\.?\d*)\s*([\+\-\*\/])\s*(-?\d+\.?\d*)$/);
    if (match) {
      const a = parseFloat(match[1]);
      const op = match[2];
      const b = parseFloat(match[3]);
      
      switch (op) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '*': result = a * b; break;
        case '/': result = b !== 0 ? a / b : 'undefined (division by zero)'; break;
      }
    }
    
    // Square root
    if (!result) {
      match = input.match(/^sqrt\((\d+\.?\d*)\)$/);
      if (match) {
        const num = parseFloat(match[1]);
        result = Math.sqrt(num);
      }
    }
    
    // Power
    if (!result) {
      match = input.match(/^(-?\d+\.?\d*)\s*\^\s*(\d+)$/);
      if (match) {
        const base = parseFloat(match[1]);
        const exp = parseInt(match[2]);
        result = Math.pow(base, exp);
      }
    }
    
    // Percentage: "50% of 100"
    if (!result) {
      match = input.match(/^(\d+\.?\d*)%\s*of\s*(\d+\.?\d*)$/);
      if (match) {
        const percent = parseFloat(match[1]);
        const num = parseFloat(match[2]);
        result = (percent / 100) * num;
      }
    }
    
    // Modulo: "10 mod 3"
    if (!result) {
      match = input.match(/^(\d+)\s*(?:mod|modulo)\s*(\d+)$/);
      if (match) {
        const a = parseInt(match[1]);
        const b = parseInt(match[2]);
        result = a % b;
      }
    }
    
    if (result !== null && result !== undefined && !isNaN(result)) {
      // Round to reasonable precision
      if (typeof result === 'number' && !Number.isInteger(result)) {
        result = Math.round(result * 1000000) / 1000000;
      }
      return `The result is: ${result}`;
    }
    
    return null;
  }

  /**
   * Parse and perform unit conversion
   * @param {string} input - Conversion query
   * @returns {string} Result or null if invalid
   */
  function parseConversion(input) {
    // Pattern: "5 km to miles" or "100 fahrenheit to celsius"
    const patterns = [
      /^(-?\d+\.?\d*)\s*(km|m|cm|mm|ft|in|mi|yd)\s+(?:to|in|->)\s+(km|m|cm|mm|ft|in|mi|yd)$/i,
      /^(-?\d+\.?\d*)\s*(kg|g|mg|lb|oz|ton)\s+(?:to|in|->)\s+(kg|g|mg|lb|oz|ton)$/i,
      /^(-?\d+\.?\d*)\s*(celsius|c|fahrenheit|f|kelvin|k)\s+(?:to|in|->)\s+(celsius|c|fahrenheit|f|kelvin|k)$/i
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        const value = parseFloat(match[1]);
        const fromUnit = match[2].toLowerCase();
        const toUnit = match[3].toLowerCase();
        
        // Normalize unit names
        const unitMap = {
          'celsius': 'C', 'c': 'C',
          'fahrenheit': 'F', 'f': 'F',
          'kelvin': 'K', 'k': 'K'
        };
        
        const from = unitMap[fromUnit] || fromUnit;
        const to = unitMap[toUnit] || toUnit;
        
        // Check if conversion is valid
        let result;
        
        // Temperature conversion
        if (CONVERSIONS.temperature[from] && CONVERSIONS.temperature[from][to]) {
          const convertFn = CONVERSIONS.temperature[from][to];
          result = convertFn(value);
          result = Math.round(result * 100) / 100;
          return `${value}°${from.toUpperCase()} = ${result}°${to.toUpperCase()}`;
        }
        
        // Length/weight conversion
        const category = Object.keys(CONVERSIONS).find(cat => 
          CONVERSIONS[cat][from] && CONVERSIONS[cat][from][to]
        );
        
        if (category) {
          const factor = CONVERSIONS[category][from][to];
          result = value * factor;
          result = Math.round(result * 10000) / 10000;
          return `${value} ${from} = ${result} ${to}`;
        }
        
        return `Sorry, I can't convert from ${fromUnit} to ${toUnit}.`;
      }
    }
    
    return null;
  }

  /**
   * Get a response for user input
   * @param {string} input - User input
   * @returns {Object} Response object
   */
  function getResponse(input) {
    if (!input || typeof input !== 'string') {
      return { 
        success: false, 
        content: 'I didn\'t understand that. Try asking for help!',
        mode: 'offline'
      };
    }
    
    const trimmed = input.trim();
    
    // Try math calculation
    const mathResult = parseMath(trimmed);
    if (mathResult) {
      return {
        success: true,
        content: mathResult,
        mode: 'offline'
      };
    }
    
    // Try unit conversion
    const conversionResult = parseConversion(trimmed);
    if (conversionResult) {
      return {
        success: true,
        content: conversionResult,
        mode: 'offline'
      };
    }
    
    // Try knowledge base
    const patternResult = matchPattern(trimmed);
    if (patternResult && patternResult.matched) {
      return {
        success: true,
        content: patternResult.response,
        mode: 'offline'
      };
    }
    
    // Default response for unrecognized input
    return {
      success: true,
      content: `I'm in offline mode and couldn't process that specific request. Try:\n\n• "help" for available commands\n• "fact" for a random fact\n• "5 + 3" for math\n• "10 km to miles" for conversion`,
      mode: 'offline'
    };
  }

  /**
   * Get a simple acknowledgment response
   * @returns {Object} Response object
   */
  function getAcknowledgment() {
    return {
      success: true,
      content: 'I\'m in offline mode right now. The AI assistant will be available when the network connection is restored.',
      mode: 'offline'
    };
  }

  // Public API
  return {
    getResponse,
    getAcknowledgment,
    matchPattern,
    parseMath,
    parseConversion,
    getRandomFact
  };

})();

// Export to global scope
window.OfflineMode = OfflineMode;

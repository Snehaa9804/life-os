# 🤖 AI-Powered Food Analysis Setup

## Overview
The Health section now features **AI-powered nutrition analysis** using Google's Gemini API. Simply describe what you ate in natural language, and the AI will automatically:

- ✅ Calculate food quality score (1-5)
- ✅ Detect junk food
- ✅ Estimate calories and macros
- ✅ Provide personalized health insights

## Setup Instructions

### 1. Get Your Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy your API key

### 2. Configure Environment Variable
1. Create a `.env` file in the project root (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your API key:
   ```env
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Important**: Never commit your `.env` file to version control!

### 3. Restart Development Server
```bash
npm run dev
```

## How to Use

1. Navigate to the **Health & Vitality** section
2. Click **"LOG FOOD"** button
3. Describe your meal naturally, for example:
   - "Grilled chicken breast with brown rice and steamed broccoli"
   - "Large pepperoni pizza and cola"
   - "Oatmeal with berries, almonds, and honey"
4. Click **"Analyze"**
5. AI will process your input and automatically log:
   - Food quality score
   - Junk food detection
   - Nutritional insights

## Features

### Intelligent Analysis
- **Natural Language Processing**: Describe meals conversationally
- **Automatic Scoring**: AI determines food quality (1-5 scale)
- **Junk Food Detection**: Identifies unhealthy choices
- **Health Insights**: Personalized feedback on your nutrition

### Privacy & Security
- API calls are made directly from your browser
- No food data is stored on external servers
- All health logs remain in your local storage

## Troubleshooting

### "Unable to analyze food" Error
- Check that your API key is correctly set in `.env`
- Ensure you've restarted the dev server after adding the key
- Verify your API key is active at [Google AI Studio](https://makersuite.google.com/app/apikey)

### API Rate Limits
- Free tier: 60 requests per minute
- If you hit limits, wait a minute and try again
- Consider upgrading for higher limits

## Example Inputs

### Healthy Meals ✅
- "Salmon with quinoa and roasted vegetables"
- "Greek yogurt with granola and fresh berries"
- "Chicken stir-fry with mixed vegetables and brown rice"

### Junk Food 🚫
- "Double cheeseburger with fries and milkshake"
- "Large pepperoni pizza"
- "Candy bar and soda"

## Technical Details

- **AI Model**: Google Gemini Pro
- **Response Time**: ~2-5 seconds
- **Accuracy**: High for common foods, estimates for complex meals
- **Cost**: Free tier available (60 RPM)

---

**Note**: The AI provides estimates based on typical portions. For precise tracking, consider using a food scale and nutrition database.

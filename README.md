# 📈 Grover Forex - Modern Trading App

A beautiful, modern forex trading mobile app built with React Native, featuring real-time market data, portfolio management, and an intuitive user interface.

## ✨ Features

- **🎨 Modern UI/UX**: Dark theme with smooth animations and gradient designs
- **📊 Real-time Market Data**: Live forex rates powered by Twelve Data API
- **💼 Portfolio Management**: Track your positions and performance
- **🔒 Secure Authentication**: User registration and login with Supabase
- **📱 Cross-platform**: Works on both iOS and Android
- **⚡ Real-time Charts**: Interactive charts with technical indicators
- **🔔 Price Alerts**: Get notified about market movements
- **🌙 Dark Theme**: Modern dark theme optimized for trading

## 🏗️ Tech Stack

- **Framework**: React Native 0.74.1
- **Navigation**: React Navigation v6
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Market Data**: Twelve Data API (Free tier)
- **Charts**: React Native SVG
- **Styling**: React Native Linear Gradient
- **Icons**: React Native Vector Icons (Feather)
- **Animations**: React Native Animatable

## 📲 Screenshots

*Coming soon - The app features a modern dark theme with blue and green accents*

## 🚀 Getting Started

### Prerequisites

- Node.js (>= 18.0.0)
- React Native development environment set up
- Android Studio (for Android development)
- Xcode (for iOS development - macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd grover-forex
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup API Keys**
   
   **Twelve Data API (Free)**:
   - Go to [Twelve Data](https://twelvedata.com/)
   - Sign up for a free account
   - Get your API key from the dashboard
   
   **Supabase (Free)**:
   - Go to [Supabase](https://supabase.com/)
   - Create a new project
   - Get your project URL and anon key from Settings > API

4. **Configure API Keys**
   
   Edit `src/config/apiConfig.js` and replace the placeholder values:
   ```javascript
   export const API_CONFIG = {
     TWELVE_DATA_API_KEY: 'your_actual_twelve_data_api_key',
     SUPABASE_URL: 'your_supabase_project_url',
     SUPABASE_ANON_KEY: 'your_supabase_anon_key',
     // ...
   };
   ```

5. **Setup Supabase Database**
   
   Run these SQL commands in your Supabase SQL editor:
   ```sql
   -- Create profiles table
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users ON DELETE CASCADE,
     full_name TEXT,
     avatar_url TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     PRIMARY KEY (id)
   );

   -- Create watchlists table
   CREATE TABLE watchlists (
     id SERIAL PRIMARY KEY,
     user_id UUID REFERENCES auth.users ON DELETE CASCADE,
     symbol TEXT NOT NULL,
     name TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create positions table
   CREATE TABLE positions (
     id SERIAL PRIMARY KEY,
     user_id UUID REFERENCES auth.users ON DELETE CASCADE,
     symbol TEXT NOT NULL,
     quantity DECIMAL NOT NULL,
     entry_price DECIMAL NOT NULL,
     position_type TEXT CHECK (position_type IN ('long', 'short')),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable RLS
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
   ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

   -- Create policies
   CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
   CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
   CREATE POLICY "Users can view own watchlist" ON watchlists FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can insert own watchlist" ON watchlists FOR INSERT WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "Users can delete own watchlist" ON watchlists FOR DELETE USING (auth.uid() = user_id);
   ```

6. **Install iOS dependencies (iOS only)**
   ```bash
   cd ios && pod install && cd ..
   ```

7. **Start the development server**
   ```bash
   npm start
   ```

8. **Run on device/simulator**
   ```bash
   # For Android
   npm run android
   
   # For iOS (macOS only)
   npm run ios
   ```

## 🏗️ Project Structure

```
grover-forex/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── CurrencyPairCard.js
│   │   ├── MiniChart.js
│   │   ├── PortfolioSummary.js
│   │   └── PortfolioChart.js
│   ├── config/             # Configuration files
│   │   └── apiConfig.js
│   ├── constants/          # App constants
│   │   └── colors.js
│   ├── context/            # React contexts
│   │   ├── AuthContext.js
│   │   └── ThemeContext.js
│   ├── navigation/         # Navigation configuration
│   │   └── MainTabNavigator.js
│   ├── screens/            # App screens
│   │   ├── OnboardingScreen.js
│   │   ├── LoginScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── MarketsScreen.js
│   │   ├── PortfolioScreen.js
│   │   └── SettingsScreen.js
│   └── services/           # API services
│       ├── supabase.js
│       └── twelveDataApi.js
├── App.js                  # Main app component
├── index.js               # App entry point
└── package.json           # Dependencies
```

## 🔧 Configuration

### Demo Mode

By default, the app runs in demo mode with mock data. To use real APIs:

1. Set up your API keys as described above
2. In `src/config/apiConfig.js`, set `DEMO_MODE: false`

### API Rate Limits

The free tier of Twelve Data API includes:
- 8 requests per minute
- 800 requests per day

The app includes rate limiting considerations and will show warnings in console if not configured properly.

## 🎨 UI Design

The app features a modern dark theme inspired by leading trading platforms:
- **Primary Colors**: Deep blues and gradients
- **Accent Colors**: Green for gains, red for losses
- **Typography**: Clean, readable fonts
- **Animations**: Smooth transitions and micro-interactions
- **Cards**: Elevated design with subtle shadows
- **Charts**: Interactive SVG-based charts

## 📱 Key Screens

1. **Onboarding**: Welcome flow with feature highlights
2. **Login/Register**: Secure authentication with Supabase
3. **Dashboard**: Portfolio overview with quick actions
4. **Markets**: Real-time forex pair listings
5. **Portfolio**: Position tracking and performance
6. **Settings**: User preferences and account management

## 🔐 Security Features

- Secure authentication with Supabase Auth
- Row Level Security (RLS) in database
- API key validation and warnings
- Biometric authentication support (configurable)
- Secure token storage with React Native Keychain

## 🚀 Building for Production

### Android

```bash
npm run build:android
```

### iOS

```bash
npm run build:ios
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Twelve Data** for providing free forex market data
- **Supabase** for backend infrastructure
- **React Native** community for excellent libraries
- **Feather Icons** for beautiful iconography

## 📞 Support

For support, email support@groverforex.com or join our Slack channel.

## 🗺️ Roadmap

- [ ] Real-time WebSocket price feeds
- [ ] Advanced charting with technical indicators
- [ ] Push notifications for price alerts
- [ ] Social trading features
- [ ] Educational content and tutorials
- [ ] Multi-language support
- [ ] Widget support for iOS/Android

---

**Made with ❤️ for traders worldwide**

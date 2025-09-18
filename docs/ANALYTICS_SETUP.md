# Google Analytics Integration Guide

This guide explains how to set up and use Google Analytics in your Al-Hamd Cars application.

## 🚀 Setup Instructions

### 1. Create Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Click "Start measuring"
4. Create an account:
   - Account name: "Al-Hamd Cars"
   - Property name: "Al-Hamd Cars Website"
   - Business information: Select appropriate options
   - Business objectives: Select relevant options

### 2. Get Measurement ID

After creating your property:
1. Go to Admin ⚙️ > Data Streams > Web
2. Click "Add stream"
3. Enter your website URL (e.g., `https://alhamdcars.com`)
4. Stream name: "Al-Hamd Cars Website"
5. Click "Create stream"
6. Copy your **Measurement ID** (looks like `G-XXXXXXXXXX`)

### 3. Configure Environment Variables

Add your Measurement ID to your `.env` file:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 4. Verify Setup

1. Start your development server: `npm run dev`
2. Open your browser's developer tools
3. Go to the Network tab
4. Look for requests to `www.googletagmanager.com`
5. Check the Console for any errors

## 📊 Available Tracking Events

### Page Views
- Automatic page view tracking on route changes
- Page type categorization (home, vehicles, vehicle_detail, etc.)
- User type tracking (guest, registered, admin)

### Vehicle Interactions
- `view_vehicle` - When a user views a vehicle
- `view_item` - Enhanced e-commerce tracking for vehicle views
- `add_to_comparison` - When a vehicle is added to comparison

### Conversion Events
- `book_test_drive` - Test drive booking submissions
- `book_service` - Service booking submissions
- `contact_form_submit` - Contact form submissions

### Search & Filter Events
- `search` - Search queries with result counts
- `use_filter` - Filter usage tracking

### Comparison Events
- `compare_vehicles` - Vehicle comparison interactions
- Tracks number of vehicles being compared

### Authentication Events
- `login` - User login events
- `sign_up` - User registration events

## 🎯 Using Analytics in Components

### Import Analytics Hooks

```tsx
import { useAnalytics } from '@/hooks/use-analytics'
import { useVehicleAnalytics } from '@/hooks/use-analytics'
import { useConversionAnalytics } from '@/hooks/use-analytics'
```

### Track Vehicle Views

```tsx
import { useVehicleAnalytics } from '@/hooks/use-analytics'

function VehicleCard({ vehicle }) {
  const { trackVehicleInteraction } = useVehicleAnalytics()
  
  const handleClick = () => {
    trackVehicleInteraction(vehicle.id, vehicle.make, vehicle.model, vehicle.price)
    // Navigate to vehicle details
  }
  
  return (
    <Card onClick={handleClick}>
      {/* Vehicle content */}
    </Card>
  )
}
```

### Track Conversions

```tsx
import { useConversionAnalytics } from '@/hooks/use-analytics'

function TestDriveForm() {
  const { trackTestDriveBooking } = useConversionAnalytics()
  
  const handleSubmit = async (formData) => {
    // Process booking
    await bookTestDrive(formData)
    
    // Track conversion
    trackTestDriveBooking(formData.vehicleId, formData.make, formData.model)
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

### Track Search and Filters

```tsx
import { useSearchAnalytics } from '@/hooks/use-analytics'

function SearchComponent() {
  const { trackSearch, trackFilterUsage } = useSearchAnalytics()
  
  const handleSearch = (query, results) => {
    trackSearch(query, results.length)
  }
  
  const handleFilterChange = (filterType, value) => {
    trackFilterUsage(filterType, value)
  }
  
  return (
    <div>
      {/* Search and filter components */}
    </div>
  )
}
```

### Track Custom Events

```tsx
import { useAnalytics } from '@/hooks/use-analytics'

function CustomComponent() {
  const { trackEvent } = useAnalytics()
  
  const handleCustomAction = () => {
    trackEvent('custom_action', {
      event_category: 'engagement',
      event_label: 'custom_button',
      value: 1
    })
  }
  
  return (
    <button onClick={handleCustomAction}>
      Custom Action
    </button>
  )
}
```

## 📈 Analytics Dashboard

### Key Metrics to Monitor

1. **User Engagement**
   - Page views by page type
   - Average session duration
   - Bounce rate

2. **Vehicle Performance**
   - Most viewed vehicles
   - Vehicle detail conversion rate
   - Test drive booking rate

3. **Conversion Funnel**
   - Homepage → Vehicle listing → Vehicle details → Test drive booking
   - Service booking conversion rate
   - Contact form submissions

4. **User Behavior**
   - Search query analysis
   - Filter usage patterns
   - Comparison tool usage

### Custom Reports

Create custom reports in Google Analytics:

1. Go to Reports > Custom reports
2. Create new report with dimensions:
   - Page type
   - Vehicle make/model
   - User type
3. Add metrics:
   - Page views
   - Events
   - Conversions

## 🔧 Advanced Configuration

### Custom Dimensions

The analytics setup includes custom dimensions:

1. **User Type** (`dimension1`)
   - Values: guest, registered, admin
   - Tracks user authentication status

2. **Page Type** (`dimension2`)
   - Values: home, vehicles, vehicle_detail, etc.
   - Categorizes pages for analysis

### Enhanced E-commerce

Track vehicle interactions as e-commerce events:

```tsx
import { useAnalytics } from '@/hooks/use-analytics'

const { trackEvent } = useAnalytics()

// Track vehicle view as e-commerce event
trackEvent('view_item', {
  currency: 'EGP',
  value: vehicle.price,
  items: [{
    item_id: vehicle.id,
    item_name: `${vehicle.make} ${vehicle.model}`,
    item_brand: vehicle.make,
    item_category: 'vehicle',
    price: vehicle.price
  }]
})
```

### Event Parameters

Common event parameters used:

- `event_category`: Groups related events
- `event_label`: Specific identifier for the event
- `value`: Numeric value for the event
- `currency`: Currency code for monetary values
- `items`: Array of items for e-commerce events

## 🚨 Troubleshooting

### Common Issues

1. **Events not appearing in Google Analytics**
   - Check Measurement ID in `.env` file
   - Verify network requests to Google Analytics
   - Check browser console for errors

2. **Real-time data not showing**
   - Real-time data may take 1-2 minutes to appear
   - Check if you're using the correct Google Analytics property

3. **User type not tracking correctly**
   - Verify NextAuth configuration
   - Check user session state

### Debug Mode

Enable debug mode for development:

```tsx
// In your analytics component
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    window.gtag('config', measurementId, {
      debug_mode: true
    })
  }
}, [measurementId])
```

### Testing Events

Use Google Analytics DebugView:

1. Go to Google Analytics > Admin > DebugView
2. Enable debug mode in your browser
3. Interact with your application
4. Watch events appear in real-time

## 📝 Best Practices

1. **Event Naming**
   - Use lowercase letters
   - Separate words with underscores
   - Be descriptive but concise

2. **Event Parameters**
   - Use consistent parameter names
   - Include relevant context
   - Don't include sensitive information

3. **User Privacy**
   - Anonymize IP addresses in Google Analytics settings
   - Comply with GDPR and other privacy regulations
   - Provide opt-out mechanisms

4. **Performance**
   - Load analytics scripts asynchronously
   - Minimize the number of events tracked
   - Use event sampling for high-traffic events

## 📚 Additional Resources

- [Google Analytics Documentation](https://developers.google.com/analytics)
- [Next.js Analytics Guide](https://nextjs.org/docs/going-to-production/analytics)
- [Google Tag Assistant](https://tagassistant.google.com/)
- [Google Analytics Demo Account](https://analytics.google.com/analytics/web/demoAccount)

---

For support or questions about analytics integration, please refer to the main project documentation or contact the development team.
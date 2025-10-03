# Form Submission Setup Guide

This guide will help you set up the form to submit data to Google Sheets and upload images to Cloudinary.

## Step 1: Set up Cloudinary Account

1. **Create Cloudinary Account**
   - Go to [cloudinary.com](https://cloudinary.com)
   - Sign up for a free account
   - Note down your `Cloud Name` from the dashboard

2. **Create Upload Preset**
   - Go to Settings > Upload
   - Click "Add Upload Preset"
   - Set the following:
     - **Preset Name**: `photography_contest` (or any name you prefer)
     - **Signing Mode**: `Unsigned` (for client-side uploads)
     - **Folder**: `photography-contest` (optional, for organization)
   - Save the preset

3. **Update the Code**
   - In `src/components/LandingPage.tsx`, replace:
     - `your_upload_preset` with your actual preset name
     - `your_cloud_name` with your actual cloud name

## Step 2: Set up Google Sheets and Apps Script

1. **Create Google Sheet**
   - Create a new Google Sheet
   - Name it "Photography Contest Submissions"

2. **Set up Google Apps Script**
   - In your Google Sheet, go to `Extensions` > `Apps Script`
   - Delete the default code and paste the contents of `google-apps-script.js`
   - Save the project (Ctrl+S)

3. **Deploy the Script**
   - Click "Deploy" > "New deployment"
   - Choose "Web app" as the type
   - Set the following:
     - **Execute as**: Me
     - **Who has access**: Anyone
   - Click "Deploy"
   - Copy the Web App URL

4. **Update the Code**
   - In `src/components/LandingPage.tsx`, replace `YOUR_GOOGLE_APPS_SCRIPT_URL` with your actual Web App URL

## Step 3: Test the Setup

1. **Test Cloudinary Upload**
   - Try uploading an image in your form
   - Check if the image appears in your Cloudinary dashboard

2. **Test Google Sheets Integration**
   - Submit a test form
   - Check if data appears in your Google Sheet

## Image Naming Convention

Images will be named using this format:
```
{participantname}_{class}_{last3digitsofphone}_{timestamp}
```

Example:
- Participant: "John Doe"
- Class: "Grade 10"
- Phone: "12345678901"
- Result: `john_doe_grade_10_901_1703123456789.jpg`

## Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Make sure your Cloudinary upload preset is set to "Unsigned"
   - Check that your cloud name is correct

2. **Google Apps Script Errors**
   - Make sure the script is deployed as a web app
   - Check that "Anyone" has access to the web app
   - Verify the Web App URL is correct

3. **Form Validation Errors**
   - Ensure all required fields are filled
   - Check that phone numbers are numeric and at least 11 digits
   - Verify email format is correct

### Security Notes:

- The current setup uses unsigned uploads for simplicity
- For production, consider using signed uploads for better security
- The Google Apps Script URL should be kept private

## File Structure

After setup, your Google Sheet will have these columns:
- Full Name (Bengali)
- Full Name (English)
- Institution Name
- Class
- Email
- Phone Number
- WhatsApp Number
- Image URLs (comma-separated)
- Submission Time

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify all credentials are correct
3. Test each component separately (Cloudinary upload, Google Sheets submission)

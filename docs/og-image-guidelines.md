# OG Image Guidelines

## Current Status

- **Current file**: `og-image.jpg` (temporary placeholder)
- **Recommended size**: 1200 x 630 pixels
- **Format**: JPG or PNG
- **Max file size**: < 300KB for optimal loading

## Creating Professional OG Images

### Recommended Tools

1. **Canva** (canva.com) - Free templates available
2. **Figma** (figma.com) - Professional design tool
3. **OG Image Generator** (og-image.vercel.app) - Automated generation

### Design Guidelines

- **Dimensions**: 1200 x 630 pixels (1.91:1 ratio)
- **Safe zone**: Keep important content 60px from edges
- **Text**: Large, readable fonts (avoid small text)
- **Brand**: Include logo and website name
- **Colors**: Match your brand colors (Primary: #667eea, Secondary: #764ba2)

### Content Suggestions

- Your name: "Ting Zhang"
- Title: "Software Engineer"
- Tagline: "Building Scalable Solutions"
- Background: Gradient from primary to secondary color
- Optional: Tech stack icons or keywords

### Testing

After creating your OG image, test it with:

- **Facebook Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/

## File Replacement

Simply replace `/public/og-image.jpg` with your new image.
The image is referenced in:

- `pages/index.vue` (line 238)
- `pages/blog/[slug].vue` (line 273, 281)

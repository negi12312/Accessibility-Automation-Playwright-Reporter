# Qarenatest.btsmomenta.com Accessibility Testing Framework

This framework provides comprehensive accessibility testing for the qarenatest.btsmomenta.com server using Playwright and axe DevTools.

## Features

- 🔍 **Comprehensive Accessibility Scanning** using axe-core
- 📸 **Screenshot Capture** for violations and full pages
- 📊 **Detailed HTML Reports** with visual evidence
- 🎯 **Step-by-Step Definitions** for easy test maintenance
- 📈 **Multiple Report Formats** (Custom HTML + axe-html-reporter)
- 🌐 **Multi-Page Testing** (Homepage, Login, Register, Forgot Password)

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Running the Tests

#### Run Complete Accessibility Suite
```bash
npm run qarenatest
```

#### Run Original Test (if needed)
```bash
npm run qarenatest-original
```

#### Run Specific Test File
```bash
npx playwright test qarenatest-accessibility-comprehensive.spec.ts --project=chromium
```

## Test Structure

### Step Definitions (`pageObjects/QarenatestAccessibilitySteps.page.ts`)

The step definitions provide reusable methods for:

- **Navigation Steps:**
  - `navigateToHomepage()`
  - `navigateToLoginPage()`
  - `navigateToRegisterPage()`
  - `navigateToForgotPasswordPage()`

- **Screenshot Steps:**
  - `takeFullPageScreenshot(screenshotName)`
  - `takeElementScreenshot(selector, screenshotName)`

- **Accessibility Testing Steps:**
  - `runBasicAccessibilityCheck()`
  - `runComprehensiveAccessibilityScan()`
  - `captureViolationScreenshots(accessibilityResults, label)`

- **Report Generation Steps:**
  - `generateDetailedHtmlReport(accessibilityResults, pageLabel, url)`
  - `generateComprehensiveFinalReport(allResults, allViolations)`
  - `generateAxeHtmlReport(allViolations, allPasses, allIncomplete)`

### Test Files

1. **`qarenatest-accessibility-comprehensive.spec.ts`** - Main comprehensive test suite
2. **`qarenatest-accessibility.spec.ts`** - Original detailed test implementation

## Generated Reports

### Report Locations
All reports are generated in the `build/reports/` directory:

```
build/reports/
├── qarenatest-comprehensive-accessibility-report.html    # Main comprehensive report
├── qarenatest-axe-report.html                           # axe-html-reporter format
├── accessibility-report-home-page.html                  # Individual page reports
├── accessibility-report-login-page.html
├── accessibility-report-register-page.html
├── accessibility-report-forgot-password.html
└── screenshots/                                         # Screenshot directory
    ├── fullpage-*.png
    └── violation-*.png
```

### Report Features

- **Visual Screenshots** with lightbox functionality
- **Violation Details** with WCAG guidelines
- **Element-specific Screenshots** for each violation
- **Summary Statistics** and metrics
- **Responsive Design** with Bootstrap styling
- **Interactive Elements** for better navigation

## Accessibility Standards

The tests check against:
- **WCAG 2.1 AA** compliance
- **WCAG 2.0 AA** compliance  
- **WCAG 2.0 A** compliance

### Tested Pages

1. **Homepage** (`https://qarenatest.btsmomenta.com/`)
2. **Login Page** (`https://qarenatest.btsmomenta.com/#/auth/login`)
3. **Registration Page** (`https://qarenatest.btsmomenta.com/#/auth/register`)
4. **Forgot Password Page** (`https://qarenatest.btsmomenta.com/#/auth/forgot-password`)

## Configuration

### Playwright Configuration
The tests use the default Playwright configuration with:
- **Browser:** Chromium
- **Workers:** 1 (for sequential execution)
- **Timeout:** Default Playwright timeouts
- **Screenshots:** Full page and element-specific

### Accessibility Configuration
- **Color Contrast:** Enabled
- **WCAG Tags:** wcag2a, wcag2aa, wcag21aa, wcag21a
- **Iframes:** Included in scanning
- **Detailed Reports:** Enabled with HTML output

## Usage Examples

### Basic Test Execution
```typescript
import { QarenatestAccessibilitySteps } from '../pageObjects/QarenatestAccessibilitySteps.page';

test('Accessibility Test', async ({ page }) => {
    const steps = new QarenatestAccessibilitySteps(page);
    
    // Navigate to page
    await steps.navigateToHomepage();
    
    // Run accessibility scan
    const results = await steps.runComprehensiveAccessibilityScan();
    
    // Generate report
    await steps.generateDetailedHtmlReport(results, 'test-page', page.url());
});
```

### Custom Page Testing
```typescript
test('Custom Page Test', async ({ page }) => {
    const steps = new QarenatestAccessibilitySteps(page);
    
    // Navigate to custom URL
    await page.goto('https://qarenatest.btsmomenta.com/custom-page');
    
    // Take screenshot
    await steps.takeFullPageScreenshot('custom-page');
    
    // Run scan and generate report
    const results = await steps.runComprehensiveAccessibilityScan();
    await steps.generateDetailedHtmlReport(results, 'custom-page', page.url());
});
```

## Troubleshooting

### Common Issues

1. **Network Timeouts:** Increase wait times in navigation methods
2. **Screenshot Failures:** Check directory permissions for `build/reports/screenshots/`
3. **Report Generation Errors:** Ensure `build/reports/` directory exists

### Debug Mode

Run with debug output:
```bash
DEBUG=pw:api npx playwright test qarenatest-accessibility-comprehensive.spec.ts
```

### Headless Mode

Run in headless mode (faster):
```bash
npx playwright test qarenatest-accessibility-comprehensive.spec.ts --headed=false
```

## Dependencies

- `@playwright/test` - Test framework
- `@axe-core/playwright` - Accessibility testing
- `axe-playwright` - Additional axe integration
- `axe-html-reporter` - Report generation
- `@types/node` - TypeScript definitions

## Contributing

When adding new tests or step definitions:

1. Follow the existing naming conventions
2. Add proper error handling
3. Include console logging for debugging
4. Update this README with new features
5. Test thoroughly before committing

## Support

For issues or questions:
1. Check the generated reports for detailed error information
2. Review console output for debugging information
3. Ensure all dependencies are properly installed
4. Verify network connectivity to qarenatest.btsmomenta.com

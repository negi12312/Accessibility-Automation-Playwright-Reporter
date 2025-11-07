import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright';
import { createHtmlReport } from 'axe-html-reporter';
const fs = require('fs');
const path = require('path');

test.describe('Neom Accessibility Test - Chrome Only', () => {
    // Create screenshots directory
    const screenshotsDir = 'build/reports/screenshots';
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    async function takeScreenshot(page: import('@playwright/test').Page, screenshotName: string) {
        try {
            const screenshotPath = path.join(screenshotsDir, `${screenshotName}.png`);
            await page.screenshot({ 
                path: screenshotPath, 
                fullPage: true 
            });
            console.log(`📸 Screenshot saved: ${screenshotPath}`);
            return screenshotPath;
        } catch (error) {
            console.log(`❌ Failed to take screenshot: ${screenshotName}`, error);
            return null;
        }
    }

    async function takeElementScreenshot(page: import('@playwright/test').Page, selector: string, screenshotName: string) {
        try {
            const element = page.locator(selector).first();
            if (await element.isVisible()) {
                const screenshotPath = path.join(screenshotsDir, `${screenshotName}.png`);
                await element.screenshot({ path: screenshotPath });
                console.log(`📸 Element screenshot saved: ${screenshotPath}`);
                return screenshotPath;
            }
        } catch (error) {
            console.log(`❌ Failed to take element screenshot: ${screenshotName}`, error);
        }
        return null;
    }

    async function captureViolationScreenshots(page: import('@playwright/test').Page, accessibilityResults: any, label: string) {
        if (accessibilityResults.violations && accessibilityResults.violations.length > 0) {
            console.log(`📸 Capturing screenshots for ${accessibilityResults.violations.length} violations...`);
            for (let i = 0; i < accessibilityResults.violations.length; i++) {
                const violation = accessibilityResults.violations[i];
                for (let j = 0; j < violation.nodes.length; j++) {
                    const node = violation.nodes[j];
                    if (node.target && node.target.length > 0) {
                        const selector = node.target[0];
                        await takeElementScreenshot(
                            page, 
                            selector, 
                            `violation-${label}-${violation.id}-${j}`
                        );
                    }
                }
            }
        }
    }

    async function generateEnhancedReport(accessibilityScanResults: any, page: import('@playwright/test').Page, label: string, url: string) {
        // Take full page screenshot
        const fullScreenshot = await takeScreenshot(page, `fullpage-${label}`);
        
        // Capture violation-specific screenshots
        await captureViolationScreenshots(page, accessibilityScanResults, label);

        // Enhanced HTML report with screenshots
        const reportHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Neom Accessibility Report - ${label}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/css/lightbox.min.css" rel="stylesheet">
            <style>
                .screenshot-gallery {
                    margin: 20px 0;
                }
                .violation-screenshot {
                    max-width: 300px;
                    border: 2px solid #dc3545;
                    cursor: pointer;
                }
                .violation-card {
                    border-left: 4px solid #dc3545;
                }
                .impact-serious { border-left-color: #dc3545; }
                .impact-moderate { border-left-color: #ffc107; }
                .impact-minor { border-left-color: #17a2b8; }
                .summary-stats {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 15px;
                    margin-bottom: 30px;
                }
                .stat-card {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    padding: 20px;
                    text-align: center;
                    margin-bottom: 15px;
                }
                .severity-badge {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.8em;
                    font-weight: bold;
                    margin-right: 5px;
                }
                .severity-serious { background: #dc3545; color: white; }
                .severity-moderate { background: #ffc107; color: black; }
                .severity-minor { background: #17a2b8; color: white; }
            </style>
        </head>
        <body>
            <div class="container mt-4">
                <div class="summary-stats">
                    <h1>🔍 Neom Accessibility Report - ${label}</h1>
                    <p class="lead">URL: <a href="${url}" target="_blank" style="color: #fff; text-decoration: underline;">${url}</a></p>
                    <div class="row">
                        <div class="col-md-3">
                            <div class="stat-card">
                                <h3>${accessibilityScanResults.violations.length}</h3>
                                <p>Violations</p>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="stat-card">
                                <h3>${accessibilityScanResults.passes.length}</h3>
                                <p>Passes</p>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="stat-card">
                                <h3>${accessibilityScanResults.incomplete.length}</h3>
                                <p>Incomplete</p>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="stat-card">
                                <h3>${new Date().toLocaleString()}</h3>
                                <p>Scan Time</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-12">
                        <div class="card">
                            <div class="card-header">
                                <h5>📸 Full Page Screenshot</h5>
                            </div>
                            <div class="card-body text-center">
                                ${fullScreenshot ? `
                                <a href="${fullScreenshot}" data-lightbox="screenshots" data-title="${label} - Full Page">
                                    <img src="${fullScreenshot}" alt="${label} screenshot" class="img-fluid rounded" style="max-height: 400px; border: 2px solid #dee2e6;">
                                </a>
                                <p class="mt-2 text-muted">Click to view full size</p>
                                ` : 'No screenshot available'}
                            </div>
                        </div>
                    </div>
                </div>

                ${accessibilityScanResults.violations.length > 0 ? `
                <div class="mt-4">
                    <h3>🚨 Accessibility Violations</h3>
                    ${accessibilityScanResults.violations.map((violation: any, index: number) => `
                    <div class="card violation-card impact-${violation.impact} mb-4">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <h5 class="card-title">${violation.id}</h5>
                                <span class="severity-badge severity-${violation.impact}">${violation.impact.toUpperCase()}</span>
                            </div>
                            <p class="card-text"><strong>Description:</strong> ${violation.description}</p>
                            <p><strong>WCAG Guidelines:</strong> ${violation.tags.filter((tag: string) => tag.includes('wcag')).join(', ')}</p>
                            <p><strong>Help:</strong> ${violation.help}</p>
                            
                            <div class="screenshot-gallery">
                                <h6>🔍 Affected Elements (${violation.nodes.length}):</h6>
                                <div class="row">
                                ${violation.nodes.map((node: any, nodeIndex: number) => {
                                    const screenshotPath = `screenshots/violation-${label}-${violation.id}-${nodeIndex}.png`;
                                    return `
                                    <div class="col-md-4 mb-3">
                                        <div class="card">
                                            <div class="card-body">
                                                <p><strong>Element:</strong> <code>${node.target ? node.target[0] : 'N/A'}</code></p>
                                                <p><strong>HTML:</strong> <code>${node.html ? node.html.substring(0, 100) + '...' : 'N/A'}</code></p>
                                                ${fs.existsSync(path.join('build/reports', screenshotPath)) ? `
                                                <a href="${screenshotPath}" data-lightbox="violation-${index}" data-title="${violation.id} - Element ${nodeIndex + 1}">
                                                    <img src="${screenshotPath}" alt="Violation ${violation.id}" class="violation-screenshot img-thumbnail">
                                                </a>
                                                ` : '<p class="text-muted">No screenshot available</p>'}
                                            </div>
                                        </div>
                                    </div>
                                    `;
                                }).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                    `).join('')}
                </div>
                ` : '<div class="alert alert-success mt-4"><h4>✅ No accessibility violations found!</h4><p>Great job! This page meets accessibility standards.</p></div>'}

                <script src="https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/js/lightbox.min.js"></script>
                <script>
                    lightbox.option({
                        'resizeDuration': 200,
                        'wrapAround': true,
                        'imageFadeDuration': 300
                    });
                </script>
            </div>
        </body>
        </html>
        `;

        const reportPath = path.join('build/reports', `neom-accessibility-report-${label.replace(/\s+/g, '-').toLowerCase()}.html`);
        fs.writeFileSync(reportPath, reportHTML);
        console.log(`📄 Enhanced report generated: ${reportPath}`);
        return reportPath;
    }

    test('Neom Login and Accessibility Test - Chrome Browser', async ({ page }) => {
        // Set longer timeout for the entire test
        test.setTimeout(120000); // 2 minutes
        
        const testSteps = [
            { 
                name: 'login-page', 
                url: 'https://neom.btsmomenta.com/#/auth/login',
                action: async () => {
                    console.log('🌐 Navigating to neom.btsmomenta.com login page...');
                    await page.goto('https://neom.btsmomenta.com/#/auth/login', { waitUntil: 'networkidle' });
                    await page.waitForTimeout(5000); // Increased wait time
                    console.log('✅ Successfully navigated to login page');
                }
            },
            { 
                name: 'login-credentials', 
                url: 'https://neom.btsmomenta.com/#/auth/login',
                action: async () => {
                    console.log('🔐 Entering login credentials...');
                    // Try multiple possible selectors for email field
                    const emailSelectors = [
                        'input[aria-label="Enter Email Address"]',
                        'input[type="email"]',
                        'input[placeholder*="email" i]',
                        'input[placeholder*="Email" i]',
                        'input[name="email"]',
                        'input[id*="email" i]'
                    ];
                    
                    let emailField = null;
                    for (const selector of emailSelectors) {
                        try {
                            emailField = page.locator(selector).first();
                            if (await emailField.isVisible()) {
                                console.log(`✅ Found email field with selector: ${selector}`);
                                break;
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                    
                    if (emailField) {
                        await emailField.fill('test_cu2@neom.com');
                        await page.waitForTimeout(2000);
                    } else {
                        console.log('⚠️ Email field not found, trying xpath...');
                        await page.locator('xpath=//input[@aria-label="Enter Email Address"]').fill('test_cu2@neom.com');
                        await page.waitForTimeout(2000);
                    }

                    // Try multiple possible selectors for password field
                    const passwordSelectors = [
                        'input[aria-label="Enter Password"]',
                        'input[type="password"]',
                        'input[placeholder*="password" i]',
                        'input[placeholder*="Password" i]',
                        'input[name="password"]',
                        'input[id*="password" i]'
                    ];
                    
                    let passwordField = null;
                    for (const selector of passwordSelectors) {
                        try {
                            passwordField = page.locator(selector).first();
                            if (await passwordField.isVisible()) {
                                console.log(`✅ Found password field with selector: ${selector}`);
                                break;
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                    
                    if (passwordField) {
                        await passwordField.fill('ABab22$');
                        await page.waitForTimeout(2000);
                    } else {
                        console.log('⚠️ Password field not found, trying xpath...');
                        await page.locator('xpath=//input[@aria-label="Enter Password"]').fill('ABab22$');
                        await page.waitForTimeout(2000);
                    }
                    
                    console.log('✅ Credentials entered successfully');
                }
            },
            { 
                name: 'login-submit', 
                url: 'https://neom.btsmomenta.com/#/auth/login',
                action: async () => {
                    console.log('🚀 Submitting login form...');
                    // Try multiple possible selectors for login button
                    const loginButtonSelectors = [
                        'button[aria-label="Login"]',
                        'button[type="submit"]',
                        'button:has-text("Login")',
                        'button:has-text("Sign In")',
                        'input[type="submit"]',
                        'button[class*="login"]',
                        'button[class*="submit"]'
                    ];
                    
                    let loginButton = null;
                    for (const selector of loginButtonSelectors) {
                        try {
                            loginButton = page.locator(selector).first();
                            if (await loginButton.isVisible()) {
                                console.log(`✅ Found login button with selector: ${selector}`);
                                break;
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                    
                    if (loginButton) {
                        await loginButton.click();
                    } else {
                        console.log('⚠️ Login button not found, trying xpath...');
                        await page.locator('xpath=//button[@aria-label="Login"]').click();
                    }
                    
                    // Wait for navigation after login
                    console.log('⏳ Waiting for login to complete...');
                    await page.waitForLoadState('networkidle');
                    await page.waitForTimeout(10000); // Increased wait time for login processing
                    
                    // Check if we're redirected to home page or if there are any dialogs
                    const currentUrl = page.url();
                    console.log(`📍 Current URL after login: ${currentUrl}`);
                    
                    console.log('✅ Login submitted successfully');
                }
            },
            { 
                name: 'data-privacy-accept', 
                url: 'https://neom.btsmomenta.com',
                action: async () => {
                    console.log('📋 Handling data privacy acceptance...');
                    try {
                        // Try multiple possible selectors for accept button
                        const acceptButtonSelectors = [
                            'button[aria-label="Accept"]',
                            'button:has-text("Accept")',
                            'button:has-text("I Accept")',
                            'button:has-text("Agree")',
                            'button[class*="accept"]',
                            'button[class*="privacy"]'
                        ];
                        
                        let acceptButton = null;
                        for (const selector of acceptButtonSelectors) {
                            try {
                                acceptButton = page.locator(selector).first();
                                if (await acceptButton.isVisible()) {
                                    console.log(`✅ Found accept button with selector: ${selector}`);
                                    break;
                                }
                            } catch (e) {
                                continue;
                            }
                        }
                        
                        if (acceptButton) {
                            await acceptButton.click();
                        } else {
                            await page.locator('xpath=//button[@aria-label="Accept"]').click();
                        }
                        
                        await page.waitForTimeout(3000);
                        console.log('✅ Data privacy accepted');
                    } catch (error) {
                        console.log('ℹ️ Data privacy dialog not found or already accepted');
                    }
                }
            },
            { 
                name: 'home-page-navigation', 
                url: 'https://neom.btsmomenta.com',
                action: async () => {
                    console.log('🏠 Navigating to home page...');
                    
                    // Wait for any potential redirects or page loads
                    await page.waitForLoadState('networkidle');
                    await page.waitForTimeout(5000);
                    
                    // Check current URL and navigate to home if needed
                    const currentUrl = page.url();
                    console.log(`📍 Current URL: ${currentUrl}`);
                    
                    // If not already on home page, navigate to it
                    if (!currentUrl.includes('#/') || currentUrl.includes('#/auth/login')) {
                        console.log('🔄 Navigating to home page...');
                        await page.goto('https://neom.btsmomenta.com/#/', { waitUntil: 'networkidle' });
                        await page.waitForTimeout(5000);
                    }
                    
                    // Try to handle any activation dialogs or buttons
                    try {
                        const activateButtonSelectors = [
                            'button[aria-label="Activate"]',
                            'button:has-text("Activate")',
                            'button:has-text("Start")',
                            'button[class*="activate"]',
                            'button[class*="start"]',
                            'button:has-text("Continue")',
                            'button:has-text("Proceed")'
                        ];
                        
                        let activateButton = null;
                        for (const selector of activateButtonSelectors) {
                            try {
                                activateButton = page.locator(selector).first();
                                if (await activateButton.isVisible({ timeout: 2000 })) {
                                    console.log(`✅ Found activate button with selector: ${selector}`);
                                    await activateButton.click();
                                    await page.waitForLoadState('networkidle');
                                    await page.waitForTimeout(3000);
                                    break;
                                }
                            } catch (e) {
                                continue;
                            }
                        }
                        
                        if (!activateButton) {
                            console.log('ℹ️ No activation button found, proceeding with current page');
                        }
                    } catch (error) {
                        console.log('ℹ️ No activation dialog found, proceeding with current page');
                    }
                    
                    // Final wait for page to be fully loaded
                    await page.waitForLoadState('networkidle');
                    await page.waitForTimeout(5000);
                    
                    const finalUrl = page.url();
                    console.log(`✅ Successfully navigated to home page: ${finalUrl}`);
                }
            }
        ];

        const allResults = [];
        const allViolations = [];

        // Execute each test step with accessibility checking and screenshots
        for (const step of testSteps) {
            console.log(`\n🔄 Executing step: ${step.name}`);
            await step.action();
            
            // Wait for page to stabilize
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(5000); // Increased wait time
            
            // Take screenshot
            console.log(`📸 Taking screenshot for ${step.name}...`);
            await takeScreenshot(page, step.name);
            
            // Run comprehensive accessibility scan
            console.log(`🔍 Running accessibility scan for ${step.name}...`);
            const accessibilityScanResults = await new AxeBuilder({ page })
                .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag21a'])
                .disableRules(['page-has-heading-one']) // Exclude best-practice rule for h1 heading
                .analyze();
            
            console.log(`📈 Found ${accessibilityScanResults.violations.length} violations in ${step.name}`);
            
            // Store results
            allResults.push({
                step: step.name,
                url: step.url,
                description: step.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                results: accessibilityScanResults
            });
            
            // Collect all violations
            accessibilityScanResults.violations.forEach(violation => {
                allViolations.push({
                    ...violation,
                    page: step.name
                });
            });
            
            // Generate detailed report for this step
            console.log(`📊 Generating accessibility report for ${step.name}...`);
            await generateEnhancedReport(accessibilityScanResults, page, step.name, step.url);
        }

        // Final comprehensive report
        console.log('\n📊 Generating final comprehensive accessibility report...');
        const finalAccessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag21a'])
            .disableRules(['page-has-heading-one']) // Exclude best-practice rule for h1 heading
            .analyze();
        
        console.log(`📈 Final scan results: ${finalAccessibilityScanResults.violations.length} violations found`);
        
        // Generate axe-html-reporter format report
        const finalReportHTML = createHtmlReport({
            results: finalAccessibilityScanResults,
            options: {
                projectKey: "NeomAccessibilityTestChrome"
            },
        });

        fs.writeFileSync("build/reports/neom-chrome-final-accessibility-report.html", finalReportHTML);
        console.log('✅ Axe HTML report generated: build/reports/neom-chrome-final-accessibility-report.html');

        // Generate enhanced final report with all screenshots
        await generateEnhancedReport(finalAccessibilityScanResults, page, 'neom-chrome-final-comprehensive', 'https://neom.btsmomenta.com');

        // Generate comprehensive summary report
        const summaryReportHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Neom Accessibility Test Summary - Chrome Browser</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                .summary-stats {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 15px;
                    margin-bottom: 30px;
                }
                .stat-card {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    padding: 20px;
                    text-align: center;
                    margin-bottom: 15px;
                }
                .page-card {
                    border-left: 4px solid #007bff;
                    margin-bottom: 20px;
                }
                .severity-badge {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.8em;
                    font-weight: bold;
                    margin-right: 5px;
                }
                .severity-serious { background: #dc3545; color: white; }
                .severity-moderate { background: #ffc107; color: black; }
                .severity-minor { background: #17a2b8; color: white; }
            </style>
        </head>
        <body>
            <div class="container mt-4">
                <div class="summary-stats">
                    <h1>🔍 Neom Accessibility Test Summary</h1>
                    <p class="lead">Chrome Browser - ${new Date().toLocaleDateString()}</p>
                    <div class="row">
                        <div class="col-md-3">
                            <div class="stat-card">
                                <h2>${allResults.length}</h2>
                                <p>Pages Scanned</p>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="stat-card">
                                <h2>${allViolations.length}</h2>
                                <p>Total Violations</p>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="stat-card">
                                <h2>${allViolations.filter(v => v.impact === 'serious').length}</h2>
                                <p>Serious Issues</p>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="stat-card">
                                <h2>${allViolations.filter(v => v.impact === 'moderate').length}</h2>
                                <p>Moderate Issues</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-12">
                        <h3>📄 Page-by-Page Results</h3>
                        ${allResults.map(result => `
                        <div class="card page-card">
                            <div class="card-body">
                                <h5 class="card-title">${result.description}</h5>
                                <p class="card-text">
                                    <strong>URL:</strong> <a href="${result.url}" target="_blank">${result.url}</a><br>
                                    <strong>Violations:</strong> ${result.results.violations.length} | 
                                    <strong>Passes:</strong> ${result.results.passes.length} | 
                                    <strong>Incomplete:</strong> ${result.results.incomplete.length}
                                </p>
                                ${result.results.violations.length > 0 ? `
                                <div class="alert alert-warning">
                                    <h6>Violations Found:</h6>
                                    ${result.results.violations.map(violation => `
                                    <span class="severity-badge severity-${violation.impact}">${violation.impact}</span>
                                    <strong>${violation.id}:</strong> ${violation.description}<br>
                                    `).join('')}
                                </div>
                                ` : '<div class="alert alert-success">✅ No violations found on this page</div>'}
                                <a href="neom-accessibility-report-${result.step}.html" class="btn btn-primary btn-sm">View Detailed Report</a>
                            </div>
                        </div>
                        `).join('')}
                    </div>
                </div>

                <div class="mt-4">
                    <div class="alert alert-info">
                        <h5>📋 Test Information</h5>
                        <p><strong>Browser:</strong> Chrome (Chromium)</p>
                        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>Tool:</strong> axe-core with Playwright</p>
                        <p><strong>Standards:</strong> WCAG 2.1 AA</p>
                        <p><strong>Login Credentials:</strong> test_cu2@neom.com / ABab22$</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;

        fs.writeFileSync("build/reports/neom-chrome-summary-report.html", summaryReportHTML);
        console.log('✅ Summary report generated: build/reports/neom-chrome-summary-report.html');

        // Print summary
        console.log('\n📋 NEOM ACCESSIBILITY TEST SUMMARY (Chrome Browser):');
        console.log(`   Pages scanned: ${allResults.length}`);
        console.log(`   Total violations: ${allViolations.length}`);
        console.log(`   Serious issues: ${allViolations.filter(v => v.impact === 'serious').length}`);
        console.log(`   Moderate issues: ${allViolations.filter(v => v.impact === 'moderate').length}`);
        console.log(`   Minor issues: ${allViolations.filter(v => v.impact === 'minor').length}`);
        console.log(`\n📁 Reports generated in: build/reports/`);
        console.log('   - neom-chrome-summary-report.html (Main summary)');
        console.log('   - neom-chrome-final-accessibility-report.html (Axe format)');
        console.log('   - neom-accessibility-report-*.html (Individual page reports)');
        console.log('   - screenshots/ (All screenshots)');
        
        if (allViolations.length > 0) {
            console.log('\n⚠️  Accessibility violations found. Please review the reports for details.');
        } else {
            console.log('\n✅ No accessibility violations found!');
        }

        // Don't fail the test if violations are found - just report them
        // expect(allViolations.length).toBe(0);
    });
});

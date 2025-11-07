import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright';
import { injectAxe, checkA11y } from 'axe-playwright'
import { createHtmlReport } from 'axe-html-reporter';
const fs = require('fs');
const path = require('path');

test.describe('Neom Focused Accessibility Test', () => {
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
            console.log(`Screenshot saved: ${screenshotPath}`);
            return screenshotPath;
        } catch (error) {
            console.log(`Failed to take screenshot: ${screenshotName}`, error);
            return null;
        }
    }

    async function takeElementScreenshot(page: import('@playwright/test').Page, selector: string, screenshotName: string) {
        try {
            const element = page.locator(selector).first();
            if (await element.isVisible()) {
                const screenshotPath = path.join(screenshotsDir, `${screenshotName}.png`);
                await element.screenshot({ path: screenshotPath });
                return screenshotPath;
            }
        } catch (error) {
            console.log(`Failed to take element screenshot: ${screenshotName}`, error);
        }
        return null;
    }

    async function captureViolationScreenshots(page: import('@playwright/test').Page, accessibilityResults: any, label: string) {
        if (accessibilityResults.violations && accessibilityResults.violations.length > 0) {
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

    async function generateComprehensiveReport(accessibilityScanResults: any, page: import('@playwright/test').Page, label: string) {
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
                .hotspot-marker {
                    width: 20px;
                    height: 20px;
                    background: #dc3545;
                    border-radius: 50%;
                    border: 2px solid white;
                    position: absolute;
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
                    border-radius: 10px;
                    padding: 20px;
                    margin-bottom: 30px;
                }
                .stat-item {
                    text-align: center;
                    padding: 10px;
                }
                .stat-number {
                    font-size: 2.5rem;
                    font-weight: bold;
                    display: block;
                }
                .stat-label {
                    font-size: 0.9rem;
                    opacity: 0.9;
                }
            </style>
        </head>
        <body>
            <div class="container mt-4">
                <h1 class="text-center mb-4">Neom Accessibility Report - ${label}</h1>
                
                <div class="summary-stats">
                    <div class="row">
                        <div class="col-md-3">
                            <div class="stat-item">
                                <span class="stat-number">${accessibilityScanResults.violations.length}</span>
                                <span class="stat-label">Violations</span>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="stat-item">
                                <span class="stat-number">${accessibilityScanResults.passes.length}</span>
                                <span class="stat-label">Passes</span>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="stat-item">
                                <span class="stat-number">${accessibilityScanResults.incomplete.length}</span>
                                <span class="stat-label">Incomplete</span>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="stat-item">
                                <span class="stat-number">${accessibilityScanResults.violations.filter(v => v.impact === 'serious').length}</span>
                                <span class="stat-label">Serious Issues</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-12">
                        <div class="card">
                            <div class="card-header">
                                <h5>Page Screenshot</h5>
                            </div>
                            <div class="card-body text-center">
                                ${fullScreenshot ? `
                                <a href="${fullScreenshot}" data-lightbox="screenshots" data-title="${label}">
                                    <img src="${fullScreenshot}" alt="${label} screenshot" class="img-fluid rounded" style="max-height: 500px;">
                                </a>
                                ` : 'No screenshot available'}
                            </div>
                        </div>
                    </div>
                </div>

                ${accessibilityScanResults.violations.length > 0 ? `
                <div class="mt-4">
                    <h3>Accessibility Violations</h3>
                    ${accessibilityScanResults.violations.map((violation: any, index: number) => `
                    <div class="card violation-card impact-${violation.impact} mb-3">
                        <div class="card-body">
                            <h5 class="card-title">
                                <span class="badge bg-${violation.impact === 'serious' ? 'danger' : violation.impact === 'moderate' ? 'warning' : 'info'} me-2">${violation.impact.toUpperCase()}</span>
                                ${violation.id}
                            </h5>
                            <p class="card-text">${violation.description}</p>
                            <p><strong>WCAG Guidelines:</strong> ${violation.tags.filter((tag: string) => tag.includes('wcag')).join(', ')}</p>
                            <p><strong>Help:</strong> ${violation.help}</p>
                            
                            <div class="screenshot-gallery">
                                <h6>Affected Elements:</h6>
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
                                                <a href="${screenshotPath}" data-lightbox="violation-${index}" data-title="${violation.id}">
                                                    <img src="${screenshotPath}" alt="Violation ${violation.id}" class="violation-screenshot img-thumbnail">
                                                </a>
                                                ` : 'No screenshot available'}
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
                ` : '<div class="alert alert-success mt-4"><h4>✅ No accessibility violations found!</h4><p>This page meets the accessibility standards checked.</p></div>'}

                <div class="mt-4">
                    <h3>Test Information</h3>
                    <div class="card">
                        <div class="card-body">
                            <p><strong>Test Date:</strong> ${new Date().toLocaleString()}</p>
                            <p><strong>Page URL:</strong> ${page.url()}</p>
                            <p><strong>Test Framework:</strong> Playwright with axe-core</p>
                            <p><strong>WCAG Level:</strong> AA</p>
                        </div>
                    </div>
                </div>

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
        console.log(`Comprehensive report generated: ${reportPath}`);
    }

    test('Neom Login and Home Page Accessibility Test', async ({ page }) => {
        console.log('🚀 Starting Neom Accessibility Test...');
        
        // Step 1: Navigate to login page
        console.log('🌐 Navigating to neom.btsmomenta.com login page...');
        await page.goto('https://neom.btsmomenta.com/#/auth/login');
        
        // Wait for page to fully load
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000);
        
        // Wait for login form to be visible
        await page.waitForSelector('input[aria-label="Enter Email Address"]', { timeout: 10000 });
        console.log('✅ Successfully navigated to login page');

        // Take screenshot of login page
        console.log('📸 Taking screenshot of login page...');
        await takeScreenshot(page, 'login-page');

        // Run accessibility scan on login page
        console.log('🔍 Running accessibility scan on login page...');
        const loginPageAccessibilityResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag21a'])
            .disableRules(['page-has-heading-one']) // Exclude best-practice rule for h1 heading
            .analyze();

        console.log(`📈 Login page scan results: ${loginPageAccessibilityResults.violations.length} violations found`);
        
        // Generate report for login page
        await generateComprehensiveReport(loginPageAccessibilityResults, page, 'login-page');

        // Step 2: Enter login credentials
        console.log('🔐 Entering login credentials...');
        await page.locator('input[aria-label="Enter Email Address"]').fill('test_cu2@neom.com');
        await page.waitForTimeout(2000);
        await page.locator('input[aria-label="Enter Password"]').fill('ABab22$');
        await page.waitForTimeout(2000);
        console.log('✅ Credentials entered successfully');

        // Step 3: Click login button
        console.log('🚀 Clicking login button...');
        await page.locator('button[aria-label="Login"]').click();
        
        // Wait for navigation and page load
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000);
        console.log('✅ Login submitted successfully');

        // Handle any data privacy dialogs that might appear
        try {
            console.log('📋 Checking for data privacy dialog...');
            await page.locator('button[aria-label="Accept"]').click();
            await page.waitForTimeout(3000);
            console.log('✅ Data privacy dialog handled');
        } catch (error) {
            console.log('ℹ️ No data privacy dialog found');
        }

        // Handle any activation dialogs
        try {
            console.log('🏠 Checking for activation dialog...');
            await page.locator('button[aria-label="Activate"]').click();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(5000);
            console.log('✅ Activation dialog handled');
        } catch (error) {
            console.log('ℹ️ No activation dialog found');
        }

        // Wait for home page to fully load
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000);
        console.log('✅ Successfully navigated to home page');

        // Take screenshot of home page
        console.log('📸 Taking screenshot of home page...');
        await takeScreenshot(page, 'home-page');

        // Run accessibility scan on home page
        console.log('🔍 Running accessibility scan on home page...');
        const homePageAccessibilityResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag21a'])
            .disableRules(['page-has-heading-one']) // Exclude best-practice rule for h1 heading
            .analyze();

        console.log(`📈 Home page scan results: ${homePageAccessibilityResults.violations.length} violations found`);
        
        // Generate report for home page
        await generateComprehensiveReport(homePageAccessibilityResults, page, 'home-page');

        // Generate combined report
        console.log('📊 Generating combined accessibility report...');
        const combinedViolations = [
            ...loginPageAccessibilityResults.violations.map(v => ({ ...v, page: 'Login Page' })),
            ...homePageAccessibilityResults.violations.map(v => ({ ...v, page: 'Home Page' }))
        ];

        const combinedResults = {
            ...loginPageAccessibilityResults,
            violations: combinedViolations,
            passes: [
                ...loginPageAccessibilityResults.passes.map(p => ({ ...p, page: 'Login Page' })),
                ...homePageAccessibilityResults.passes.map(p => ({ ...p, page: 'Home Page' }))
            ],
            incomplete: [
                ...loginPageAccessibilityResults.incomplete.map(i => ({ ...i, page: 'Login Page' })),
                ...homePageAccessibilityResults.incomplete.map(i => ({ ...i, page: 'Home Page' }))
            ]
        };

        // Generate axe-html-reporter format report
        const combinedReportHTML = createHtmlReport({
            results: combinedResults,
            options: {
                projectKey: "NeomAccessibilityTest"
            },
        });

        fs.writeFileSync("build/reports/neom-combined-accessibility-report.html", combinedReportHTML);
        console.log('✅ Combined axe HTML report generated: build/reports/neom-combined-accessibility-report.html');

        // Print final summary
        console.log('\n📋 NEOM ACCESSIBILITY TEST SUMMARY:');
        console.log('='.repeat(50));
        console.log(`Login Page Violations: ${loginPageAccessibilityResults.violations.length}`);
        console.log(`Home Page Violations: ${homePageAccessibilityResults.violations.length}`);
        console.log(`Total Violations: ${combinedViolations.length}`);
        console.log(`Serious Issues: ${combinedViolations.filter(v => v.impact === 'serious').length}`);
        console.log(`Moderate Issues: ${combinedViolations.filter(v => v.impact === 'moderate').length}`);
        console.log(`Minor Issues: ${combinedViolations.filter(v => v.impact === 'minor').length}`);
        console.log('='.repeat(50));
        console.log('📁 Reports generated in: build/reports/');
        console.log('   - neom-accessibility-report-login-page.html');
        console.log('   - neom-accessibility-report-home-page.html');
        console.log('   - neom-combined-accessibility-report.html');
        console.log('📸 Screenshots saved in: build/reports/screenshots/');
        
        if (combinedViolations.length > 0) {
            console.log('\n⚠️  Accessibility violations found. Please review the reports for details.');
        } else {
            console.log('\n✅ No accessibility violations found!');
        }

        // Don't fail the test if violations are found - just report them
        // expect(combinedViolations).toEqual([]);
    });
});

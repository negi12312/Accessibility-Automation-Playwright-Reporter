import { Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { injectAxe, checkA11y } from 'axe-playwright';
import { createHtmlReport } from 'axe-html-reporter';
import * as fs from 'fs';
import * as path from 'path';

export class QarenatestAccessibilitySteps {
    private page: Page;
    private baseUrl: string = 'https://qarenatest.btsmomenta.com';
    private reportsDir: string = 'build/reports';
    private screenshotsDir: string = 'build/reports/screenshots';

    constructor(page: Page) {
        this.page = page;
        this.ensureDirectoriesExist();
    }

    private ensureDirectoriesExist(): void {
        if (!fs.existsSync(this.reportsDir)) {
            fs.mkdirSync(this.reportsDir, { recursive: true });
        }
        if (!fs.existsSync(this.screenshotsDir)) {
            fs.mkdirSync(this.screenshotsDir, { recursive: true });
        }
    }

    /**
     * Step: Navigate to the qarenatest.btsmomenta.com homepage
     */
    async navigateToHomepage(): Promise<void> {
        console.log('🌐 Navigating to qarenatest.btsmomenta.com homepage...');
        await this.page.goto(`${this.baseUrl}/`, { waitUntil: 'networkidle' });
        await this.page.waitForTimeout(3000);
        console.log('✅ Successfully navigated to homepage');
    }

    /**
     * Step: Navigate to the login page
     */
    async navigateToLoginPage(): Promise<void> {
        console.log('🔐 Navigating to login page...');
        await this.page.goto(`${this.baseUrl}/#/auth/login`, { waitUntil: 'networkidle' });
        await this.page.waitForTimeout(3000);
        console.log('✅ Successfully navigated to login page');
    }

    /**
     * Step: Navigate to the registration page
     */
    async navigateToRegisterPage(): Promise<void> {
        console.log('📝 Navigating to registration page...');
        await this.page.goto(`${this.baseUrl}/#/auth/register`, { waitUntil: 'networkidle' });
        await this.page.waitForTimeout(3000);
        console.log('✅ Successfully navigated to registration page');
    }

    /**
     * Step: Navigate to the forgot password page
     */
    async navigateToForgotPasswordPage(): Promise<void> {
        console.log('🔑 Navigating to forgot password page...');
        await this.page.goto(`${this.baseUrl}/#/auth/forgot-password`, { waitUntil: 'networkidle' });
        await this.page.waitForTimeout(3000);
        console.log('✅ Successfully navigated to forgot password page');
    }

    /**
     * Step: Take a full page screenshot
     */
    async takeFullPageScreenshot(screenshotName: string): Promise<string | null> {
        try {
            const screenshotPath = path.join(this.screenshotsDir, `${screenshotName}.png`);
            await this.page.screenshot({ 
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

    /**
     * Step: Take a screenshot of a specific element
     */
    async takeElementScreenshot(selector: string, screenshotName: string): Promise<string | null> {
        try {
            const element = this.page.locator(selector).first();
            if (await element.isVisible()) {
                const screenshotPath = path.join(this.screenshotsDir, `${screenshotName}.png`);
                await element.screenshot({ path: screenshotPath });
                console.log(`📸 Element screenshot saved: ${screenshotPath}`);
                return screenshotPath;
            }
        } catch (error) {
            console.log(`❌ Failed to take element screenshot: ${screenshotName}`, error);
        }
        return null;
    }

    /**
     * Step: Run basic accessibility check using axe-playwright
     */
    async runBasicAccessibilityCheck(): Promise<void> {
        console.log('🔍 Running basic accessibility check...');
        try {
            await injectAxe(this.page);
            await checkA11y(this.page, undefined, {
                detailedReport: true,
                detailedReportOptions: { html: true },
                axeOptions: {
                    iframes: true,
                    runOnly: {
                        type: 'tag',
                        values: ['wcag2a', 'wcag2aa', 'wcag21aa'],
                    },
                    rules: {
                        'color-contrast': { enabled: true },
                    }
                },
                verbose: true
            });
            console.log('✅ Basic accessibility check completed');
        } catch (error) {
            console.log('⚠️ Accessibility violations detected:', error);
        }
    }

    /**
     * Step: Run comprehensive accessibility scan using axe-core
     */
    async runComprehensiveAccessibilityScan(): Promise<any> {
        console.log('🔍 Running comprehensive accessibility scan...');
        try {
            const accessibilityScanResults = await new AxeBuilder({ page: this.page })
                .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag21a'])
                .analyze();
            
            console.log(`📊 Scan completed: ${accessibilityScanResults.violations.length} violations found`);
            return accessibilityScanResults;
        } catch (error) {
            console.log('❌ Failed to run accessibility scan:', error);
            throw error;
        }
    }

    /**
     * Step: Capture screenshots of accessibility violations
     */
    async captureViolationScreenshots(accessibilityResults: any, label: string): Promise<void> {
        if (accessibilityResults.violations && accessibilityResults.violations.length > 0) {
            console.log(`📸 Capturing screenshots for ${accessibilityResults.violations.length} violations...`);
            
            for (let i = 0; i < accessibilityResults.violations.length; i++) {
                const violation = accessibilityResults.violations[i];
                for (let j = 0; j < violation.nodes.length; j++) {
                    const node = violation.nodes[j];
                    if (node.target && node.target.length > 0) {
                        const selector = node.target[0];
                        await this.takeElementScreenshot(
                            selector, 
                            `violation-${label}-${violation.id}-${j}`
                        );
                    }
                }
            }
            console.log('✅ Violation screenshots captured');
        }
    }

    /**
     * Step: Generate detailed HTML accessibility report
     */
    async generateDetailedHtmlReport(accessibilityResults: any, pageLabel: string, url: string): Promise<string> {
        console.log(`📄 Generating detailed HTML report for ${pageLabel}...`);
        
        // Take full page screenshot
        const fullScreenshot = await this.takeFullPageScreenshot(`fullpage-${pageLabel}`);
        
        // Capture violation-specific screenshots
        await this.captureViolationScreenshots(accessibilityResults, pageLabel);

        // Enhanced HTML report with screenshots
        const reportHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Accessibility Report - ${pageLabel}</title>
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
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 30px;
                }
                .stat-card {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    padding: 15px;
                    text-align: center;
                }
                .violation-severity {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.8em;
                    font-weight: bold;
                }
                .severity-serious { background: #dc3545; color: white; }
                .severity-moderate { background: #ffc107; color: black; }
                .severity-minor { background: #17a2b8; color: white; }
            </style>
        </head>
        <body>
            <div class="container mt-4">
                <div class="summary-stats">
                    <h1>🔍 Accessibility Report - ${pageLabel}</h1>
                    <p class="lead">URL: <a href="${url}" target="_blank" style="color: #fff; text-decoration: underline;">${url}</a></p>
                    <div class="row">
                        <div class="col-md-3">
                            <div class="stat-card">
                                <h3>${accessibilityResults.violations.length}</h3>
                                <p>Violations</p>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="stat-card">
                                <h3>${accessibilityResults.passes.length}</h3>
                                <p>Passes</p>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="stat-card">
                                <h3>${accessibilityResults.incomplete.length}</h3>
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
                                <a href="${fullScreenshot}" data-lightbox="screenshots" data-title="${pageLabel} - Full Page">
                                    <img src="${fullScreenshot}" alt="${pageLabel} screenshot" class="img-fluid rounded" style="max-height: 400px; border: 2px solid #dee2e6;">
                                </a>
                                <p class="mt-2 text-muted">Click to view full size</p>
                                ` : 'No screenshot available'}
                            </div>
                        </div>
                    </div>
                </div>

                ${accessibilityResults.violations.length > 0 ? `
                <div class="mt-4">
                    <h3>🚨 Accessibility Violations</h3>
                    ${accessibilityResults.violations.map((violation: any, index: number) => `
                    <div class="card violation-card impact-${violation.impact} mb-4">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <h5 class="card-title">${violation.id}</h5>
                                <span class="violation-severity severity-${violation.impact}">${violation.impact.toUpperCase()}</span>
                            </div>
                            <p class="card-text"><strong>Description:</strong> ${violation.description}</p>
                            <p><strong>WCAG Guidelines:</strong> ${violation.tags.filter((tag: string) => tag.includes('wcag')).join(', ')}</p>
                            <p><strong>Help:</strong> ${violation.help}</p>
                            
                            <div class="screenshot-gallery">
                                <h6>🔍 Affected Elements (${violation.nodes.length}):</h6>
                                <div class="row">
                                ${violation.nodes.map((node: any, nodeIndex: number) => {
                                    const screenshotPath = `screenshots/violation-${pageLabel}-${violation.id}-${nodeIndex}.png`;
                                    return `
                                    <div class="col-md-4 mb-3">
                                        <div class="card">
                                            <div class="card-body">
                                                <p><strong>Element:</strong> <code>${node.target ? node.target[0] : 'N/A'}</code></p>
                                                <p><strong>HTML:</strong> <code>${node.html ? node.html.substring(0, 100) + '...' : 'N/A'}</code></p>
                                                ${fs.existsSync(path.join(this.reportsDir, screenshotPath)) ? `
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

                ${accessibilityResults.passes.length > 0 ? `
                <div class="mt-4">
                    <h3>✅ Passed Checks</h3>
                    <div class="row">
                        ${accessibilityResults.passes.slice(0, 10).map((pass: any) => `
                        <div class="col-md-6 mb-2">
                            <div class="card border-success">
                                <div class="card-body py-2">
                                    <h6 class="card-title text-success">${pass.id}</h6>
                                    <p class="card-text small">${pass.description}</p>
                                </div>
                            </div>
                        </div>
                        `).join('')}
                        ${accessibilityResults.passes.length > 10 ? `<div class="col-12"><p class="text-muted">... and ${accessibilityResults.passes.length - 10} more passed checks</p></div>` : ''}
                    </div>
                </div>
                ` : ''}

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

        const reportPath = path.join(this.reportsDir, `accessibility-report-${pageLabel.replace(/\s+/g, '-').toLowerCase()}.html`);
        fs.writeFileSync(reportPath, reportHTML);
        console.log(`📄 Detailed report generated: ${reportPath}`);
        return reportPath;
    }

    /**
     * Step: Generate comprehensive final report
     */
    async generateComprehensiveFinalReport(allResults: any[], allViolations: any[]): Promise<string> {
        console.log('📊 Generating comprehensive final report...');
        
        const finalReportHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Qarenatest.btsmomenta.com - Comprehensive Accessibility Report</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/css/lightbox.min.css" rel="stylesheet">
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
                .violation-summary {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 15px;
                    margin: 10px 0;
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
                    <h1>🔍 Comprehensive Accessibility Report</h1>
                    <p class="lead">Qarenatest.btsmomenta.com - ${new Date().toLocaleDateString()}</p>
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
                                <div class="violation-summary">
                                    <h6>Violations Found:</h6>
                                    ${result.results.violations.map(violation => `
                                    <span class="severity-badge severity-${violation.impact}">${violation.impact}</span>
                                    <strong>${violation.id}:</strong> ${violation.description}<br>
                                    `).join('')}
                                </div>
                                ` : '<div class="alert alert-success">✅ No violations found on this page</div>'}
                                <a href="accessibility-report-${result.step}.html" class="btn btn-primary btn-sm">View Detailed Report</a>
                            </div>
                        </div>
                        `).join('')}
                    </div>
                </div>

                ${allViolations.length > 0 ? `
                <div class="mt-4">
                    <h3>🚨 All Violations Summary</h3>
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Violation ID</th>
                                    <th>Impact</th>
                                    <th>Description</th>
                                    <th>Pages Affected</th>
                                    <th>WCAG Guidelines</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.values(allViolations.reduce((acc, violation) => {
                                    const key = violation.id;
                                    if (!acc[key]) {
                                        acc[key] = {
                                            ...violation,
                                            pages: new Set()
                                        };
                                    }
                                    acc[key].pages.add(violation.page);
                                    return acc;
                                }, {})).map(violation => `
                                <tr>
                                    <td><code>${violation.id}</code></td>
                                    <td><span class="severity-badge severity-${violation.impact}">${violation.impact}</span></td>
                                    <td>${violation.description}</td>
                                    <td>${Array.from(violation.pages).join(', ')}</td>
                                    <td>${violation.tags.filter(tag => tag.includes('wcag')).join(', ')}</td>
                                </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                ` : ''}

                <div class="mt-4">
                    <div class="alert alert-info">
                        <h5>📋 Report Information</h5>
                        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>Tool:</strong> axe-core with Playwright</p>
                        <p><strong>Standards:</strong> WCAG 2.1 AA</p>
                        <p><strong>Browser:</strong> Chromium</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;

        const finalReportPath = path.join(this.reportsDir, 'qarenatest-comprehensive-accessibility-report.html');
        fs.writeFileSync(finalReportPath, finalReportHTML);
        console.log(`📊 Comprehensive report generated: ${finalReportPath}`);
        return finalReportPath;
    }

    /**
     * Step: Generate axe-html-reporter format report
     */
    async generateAxeHtmlReport(allViolations: any[], allPasses: any[], allIncomplete: any[]): Promise<string> {
        console.log('📊 Generating axe-html-reporter format report...');
        
        const axeReport = createHtmlReport({
            results: {
                violations: allViolations,
                passes: allPasses,
                incomplete: allIncomplete,
                url: this.baseUrl,
                timestamp: new Date().toISOString()
            },
            options: {
                projectKey: "QarenatestAccessibility"
            },
        });

        const axeReportPath = path.join(this.reportsDir, 'qarenatest-axe-report.html');
        fs.writeFileSync(axeReportPath, axeReport);
        console.log(`📊 Axe report generated: ${axeReportPath}`);
        return axeReportPath;
    }

    /**
     * Step: Verify that accessibility reports were generated
     */
    async verifyReportsGenerated(): Promise<void> {
        const expectedFiles = [
            'qarenatest-comprehensive-accessibility-report.html',
            'qarenatest-axe-report.html',
            'accessibility-report-home-page.html',
            'accessibility-report-login-page.html',
            'accessibility-report-register-page.html',
            'accessibility-report-forgot-password.html'
        ];

        for (const file of expectedFiles) {
            const filePath = path.join(this.reportsDir, file);
            if (fs.existsSync(filePath)) {
                console.log(`✅ Report verified: ${file}`);
            } else {
                console.log(`❌ Report missing: ${file}`);
            }
        }
    }

    /**
     * Step: Print accessibility summary
     */
    async printAccessibilitySummary(allResults: any[], allViolations: any[]): Promise<void> {
        console.log(`\n📈 ACCESSIBILITY SUMMARY:`);
        console.log(`   Pages scanned: ${allResults.length}`);
        console.log(`   Total violations: ${allViolations.length}`);
        console.log(`   Serious issues: ${allViolations.filter(v => v.impact === 'serious').length}`);
        console.log(`   Moderate issues: ${allViolations.filter(v => v.impact === 'moderate').length}`);
        console.log(`   Minor issues: ${allViolations.filter(v => v.impact === 'minor').length}`);
        console.log(`\n📁 Reports generated in: ${this.reportsDir}`);
        
        if (allViolations.length > 0) {
            console.log(`\n⚠️  ${allViolations.length} accessibility violations found. Please review the reports for details.`);
        } else {
            console.log(`\n✅ No accessibility violations found!`);
        }
    }
}

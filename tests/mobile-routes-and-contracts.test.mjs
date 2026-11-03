import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MOBILE_DIR = path.resolve(__dirname, "..");

console.log("========================================================");
console.log(" THEIA PFC: MOBILE ROUTES & DESKTOP PARITY TEST SUITE   ");
console.log("========================================================");

let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ Passed: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`✗ FAILED: ${name}`);
    console.error(err);
    failedTests++;
  }
}

// 1. All 18 Mobile App Routes exist on disk
test("All 18 mobile routes exist and contain active component definitions", () => {
  const routes = [
    "src/app/page.tsx", // 1. Overview Dashboard
    "src/app/portfolio/page.tsx", // 2. Asset Allocation
    "src/app/wealth-trajectory/page.tsx", // 3. Wealth Trajectory & SVG chart
    "src/app/transactions/page.tsx", // 4. Transactions Ledger
    "src/app/liabilities/page.tsx", // 5. Liabilities & Loans
    "src/app/cashflow/page.tsx", // 6. Cash Flow
    "src/app/goals/page.tsx", // 7. Financial Goals
    "src/app/analytics/page.tsx", // 8. Analytics & Ratios
    "src/app/scenarios/page.tsx", // 9. Scenarios & Stress Testing
    "src/app/ai/page.tsx", // 10. AI Advisor
    "src/app/assets/page.tsx", // 11. Core Assets
    "src/app/markets/page.tsx", // 12. Markets Watchboard
    "src/app/notifications/page.tsx", // 13. Notifications & Alert Triggers
    "src/app/more/page.tsx", // 14. Unified Navigation Hub
    "src/app/settings/page.tsx", // 15. Engine Settings & Snapshots
    "src/app/profile/page.tsx", // 16. Profile & Security
    "src/app/health/page.tsx", // 17. Financial Climate
    "src/app/login/page.tsx", // 18. Authentication
  ];

  for (const relPath of routes) {
    const fullPath = path.join(MOBILE_DIR, relPath);
    assert(fs.existsSync(fullPath), `Route file missing: ${relPath}`);
    const content = fs.readFileSync(fullPath, "utf-8");
    assert(
      content.includes("export default function") ||
        content.includes("export default"),
      `Route does not default export a component: ${relPath}`
    );
  }
});

// 2. Bottom Navigation Architecture
test("Bottom navigation defines 5 primary tactile destinations with valid paths", () => {
  const navPath = path.join(MOBILE_DIR, "src/components/mobile/bottom-nav.tsx");
  assert(fs.existsSync(navPath), "bottom-nav.tsx missing");
  const navContent = fs.readFileSync(navPath, "utf-8");

  const requiredHrefs = ["/", "/portfolio", "/transactions", "/cashflow", "/more"];
  for (const href of requiredHrefs) {
    assert(
      navContent.includes(`href: "${href}"`),
      `BottomNav missing primary href: ${href}`
    );
  }
});

// 3. More Navigation Hub Coverage
test("More hub connects to all specialized financial submodules", () => {
  const morePath = path.join(MOBILE_DIR, "src/app/more/page.tsx");
  assert(fs.existsSync(morePath), "more/page.tsx missing");
  const moreContent = fs.readFileSync(morePath, "utf-8");

  const requiredSubmodules = [
    "/wealth-trajectory",
    "/analytics",
    "/health",
    "/scenarios",
    "/liabilities",
    "/goals",
    "/transactions",
    "/cashflow",
    "/markets",
    "/ai",
    "/assets",
    "/notifications",
    "/settings",
    "/profile",
  ];

  for (const mod of requiredSubmodules) {
    assert(
      moreContent.includes(`href: "${mod}"`),
      `More Hub missing link to submodule: ${mod}`
    );
  }
});

// 4. API Client Parity with Backend
test("API Client defines required authoritative endpoints without mock fallbacks", () => {
  const apiPath = path.join(MOBILE_DIR, "src/lib/api.ts");
  assert(fs.existsSync(apiPath), "api.ts missing");
  const apiContent = fs.readFileSync(apiPath, "utf-8");

  const requiredMethods = [
    "getOverview",
    "getSnapshots",
    "recordSnapshot",
    "getAccounts",
    "getAssets",
    "createAsset",
    "updateAsset",
    "deleteAsset",
    "getMarketRates",
    "syncMarketRates",
    "getMarketHistory",
    "getTransactions",
    "createTransaction",
    "getLiabilities",
    "createLiability",
    "recordLoanPayment",
    "calculateAmortization",
    "getCashflowSummary",
    "createCashflowEntry",
    "simulateScenario",
    "getGoals",
    "createGoal",
    "updateGoal",
    "deleteGoal",
    "sendAIChat",
    "getNotifications",
    "markNotificationRead",
    "markAllNotificationsRead",
    "checkMarketTriggers",
    "checkReady",
  ];

  for (const method of requiredMethods) {
    assert(
      apiContent.includes(`${method}:`),
      `API Client missing method: ${method}`
    );
  }

  // Ensure no mock data strings substituted in API calls
  assert(
    !apiContent.includes("return mockData"),
    "API Client must not substitute mockData"
  );
});

// 5. Zero Hardcoded Financial Numbers in Core State
test("Overview Dashboard binds authoritative API data to cards and metrics", () => {
  const pagePath = path.join(MOBILE_DIR, "src/app/page.tsx");
  const content = fs.readFileSync(pagePath, "utf-8");

  assert(content.includes("api.getOverview()"), "Overview must fetch real overview");
  assert(content.includes("api.getSnapshots(30)"), "Overview must fetch real snapshots for trend");
  assert(content.includes("api.getTransactions"), "Overview must fetch real recent transactions");
  assert(content.includes("api.getGoals()"), "Overview must fetch real financial goals");
  assert(content.includes("api.getNotifications"), "Overview must fetch unread notifications");
});

console.log("========================================================");
console.log(` RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log("========================================================");

if (failedTests > 0) {
  process.exit(1);
}

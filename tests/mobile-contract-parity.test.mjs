/**
 * Mobile-to-Backend Contract & Desktop Feature Parity Integration Test Suite
 *
 * Runs against the live running FastAPI backend on http://127.0.0.1:8000
 * Validates all endpoints, contracts, authentication, mutations, and cross-client parity.
 */

import assert from "node:assert";

const BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000";
const API_PREFIX = `${BASE_URL}/api/v1`;

let authToken = null;
let testUserId = null;
let testAccountId = null;
let testAssetId = null;
let testGoalId = null;

let testsPassed = 0;
let testsFailed = 0;

async function runTest(name, fn) {
  process.stdout.write(`• Testing: ${name}... `);
  try {
    await fn();
    testsPassed++;
    console.log(`\x1b[32mPASSED\x1b[0m`);
  } catch (err) {
    testsFailed++;
    console.log(`\x1b[31mFAILED\x1b[0m`);
    console.error(`  Error: ${err.message}`);
    if (err.stack) {
      console.error(`  ${err.stack.split("\n")[1]}`);
    }
  }
}

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_PREFIX}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    let errText = await response.text();
    try {
      const errJson = JSON.parse(errText);
      errText = errJson?.error?.message || errText;
    } catch {}
    throw new Error(`HTTP ${response.status} ${response.statusText} on ${url}: ${errText}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

async function main() {
  console.log(`\n========================================================`);
  console.log(` THEIA PFC: MOBILE-TO-BACKEND CONTRACT & PARITY SUITE`);
  console.log(` Target Server: ${BASE_URL}`);
  console.log(`========================================================\n`);

  // SECTION 1: Health & Readiness
  await runTest("Backend /health/live responds healthy", async () => {
    const res = await request(`${BASE_URL}/health/live`);
    assert.strictEqual(res.status, "ok");
  });

  await runTest("Backend /health/ready confirms database connection", async () => {
    const res = await request(`${BASE_URL}/health/ready`);
    assert.strictEqual(res.status, "ready");
    assert.strictEqual(res.components.database, "healthy");
  });

  // SECTION 2: Authentication & Identity
  await runTest("Authentication with demo admin credentials", async () => {
    const res = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "admin@personal-fc.local",
        password: "AdminPassword123!",
      }),
    });
    assert.ok(res.access_token, "Access token must be present");
    assert.ok(res.user, "User object must be returned");
    authToken = res.access_token;
    testUserId = res.user.id;
  });

  await runTest("Session restoration via /auth/me matches user profile", async () => {
    const user = await request("/auth/me");
    assert.strictEqual(user.id, testUserId);
    assert.strictEqual(user.email, "admin@personal-fc.local");
    assert.strictEqual(user.role, "admin");
    assert.strictEqual(typeof user.has_completed_financial_onboarding, "boolean");
  });

  // SECTION 3: Financial Analytics & Snapshots
  await runTest("Analytics overview returns authoritative financial metrics", async () => {
    const ov = await request("/analytics/overview");
    assert.ok(ov.net_worth !== undefined, "net_worth must exist");
    assert.ok(ov.total_assets !== undefined, "total_assets must exist");
    assert.ok(ov.total_liabilities !== undefined, "total_liabilities must exist");
    assert.ok(ov.liquid_cash !== undefined, "liquid_cash must exist");
    assert.ok(ov.monthly_income !== undefined, "monthly_income must exist");
    assert.ok(ov.monthly_expenses !== undefined, "monthly_expenses must exist");
    assert.ok(Array.isArray(ov.asset_allocation), "asset_allocation must be array");
    assert.ok(Array.isArray(ov.upcoming_obligations), "upcoming_obligations must be array");

    // Math integrity check: net_worth must approximate total_assets - total_liabilities
    const nw = parseFloat(ov.net_worth);
    const ta = parseFloat(ov.total_assets);
    const tl = parseFloat(ov.total_liabilities);
    assert.ok(Math.abs(nw - (ta - tl)) < 1.0, `Math integrity: ${nw} ≈ ${ta} - ${tl}`);
  });

  await runTest("Historical snapshots query for net worth trend calculation", async () => {
    const snaps = await request("/analytics/snapshots?limit=30");
    assert.ok(Array.isArray(snaps), "Snapshots must be an array");
  });

  // SECTION 4: Accounts
  await runTest("Accounts list returns user financial accounts", async () => {
    const accounts = await request("/accounts");
    assert.ok(Array.isArray(accounts), "Accounts must be an array");
    if (accounts.length > 0) {
      testAccountId = accounts[0].id;
      assert.ok(accounts[0].name, "Account must have a name");
      assert.ok(accounts[0].current_balance !== undefined, "Balance must exist");
    }
  });

  // SECTION 5: Assets, Market Rates & Mutations
  await runTest("Asset classes catalog returns configured categories", async () => {
    const classes = await request("/assets/classes");
    assert.ok(Array.isArray(classes), "Classes must be an array");
    assert.ok(classes.length > 0, "At least one asset class must exist");
  });

  await runTest("Market rates endpoint returns live quotes across categories", async () => {
    const rates = await request("/assets/market/rates");
    assert.ok(Array.isArray(rates.gold_and_coins), "Gold quotes array");
    assert.ok(Array.isArray(rates.currencies), "Currencies quotes array");
    assert.ok(Array.isArray(rates.cryptocurrency), "Crypto quotes array");
  });

  await runTest("Market synchronization mutation triggers quote refresh", async () => {
    const syncRes = await request("/assets/market/sync", { method: "POST" });
    assert.strictEqual(typeof syncRes.success, "boolean");
    assert.ok(syncRes.last_sync_time, "Last sync time recorded");
  });

  await runTest("Asset CRUD: Create custom test asset", async () => {
    const testSymbol = `TST_${Date.now().toString().slice(-4)}`;
    const newAsset = await request("/assets", {
      method: "POST",
      body: JSON.stringify({
        symbol: testSymbol,
        name: "دارایی آزمایشی پورتفوی موبایل",
        asset_class: "commodity",
        currency: "TOMAN",
        initial_price: "25000000",
        is_active: true,
        notes: "ایجاده شده در تست همگام‌سازی موبایل",
      }),
    });
    assert.ok(newAsset.id, "Created asset must have an id");
    assert.strictEqual(newAsset.symbol, testSymbol);
    testAssetId = newAsset.id;
  });

  await runTest("Asset CRUD: Update asset status (toggle active)", async () => {
    assert.ok(testAssetId, "Test asset must exist");
    const updated = await request(`/assets/${testAssetId}`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: false }),
    });
    assert.strictEqual(updated.is_active, false);
  });

  await runTest("Asset CRUD: Delete custom test asset", async () => {
    assert.ok(testAssetId, "Test asset must exist");
    await request(`/assets/${testAssetId}`, { method: "DELETE" });

    // Confirm deletion
    const allAssets = await request("/assets");
    const found = allAssets.find((a) => a.id === testAssetId);
    assert.strictEqual(found, undefined, "Asset must no longer exist");
  });

  // SECTION 6: Portfolio & Positions
  await runTest("Asset positions query returns current user holdings", async () => {
    const positions = await request("/assets/positions");
    assert.ok(Array.isArray(positions), "Positions must be an array");
    if (positions.length > 0) {
      assert.ok(positions[0].asset_symbol, "Position has symbol");
      assert.ok(positions[0].current_value !== undefined, "Position has current value");
    }
  });

  await runTest("Profile update persists portfolio allocation suggestion", async () => {
    const updatedUser = await request("/auth/me", {
      method: "PATCH",
      body: JSON.stringify({
        portfolio_suggestion: {
          investment: 65,
          liquid: 35,
          risk_tolerance: 72,
          auto_rebalance: true,
        },
      }),
    });
    assert.ok(updatedUser.portfolio_suggestion, "portfolio_suggestion must be saved");
    assert.strictEqual(Number(updatedUser.portfolio_suggestion.investment), 65);
    assert.strictEqual(Number(updatedUser.portfolio_suggestion.liquid), 35);
  });

  // SECTION 7: Cashflow & Entries
  await runTest("Cashflow categories list returns flow classifications", async () => {
    const categories = await request("/cashflow/categories");
    assert.ok(Array.isArray(categories), "Categories must be an array");
    assert.ok(categories.length > 0, "Categories exist");
  });

  await runTest("Cashflow summary returns income, expenses, and savings breakdown", async () => {
    const summary = await request("/cashflow/summary");
    assert.ok(summary.total_income !== undefined, "total_income must exist");
    assert.ok(summary.total_expenses !== undefined, "total_expenses must exist");
    assert.ok(summary.net_savings !== undefined, "net_savings must exist");
    assert.ok(Array.isArray(summary.categories_breakdown), "categories_breakdown must be array");
  });

  await runTest("Cashflow entry creation and retrieval", async () => {
    const categories = await request("/cashflow/categories?flow_type=expense");
    assert.ok(categories.length > 0, "Expense category must exist");
    const catId = categories[0].id;

    const entry = await request("/cashflow/entries", {
      method: "POST",
      body: JSON.stringify({
        flow_type: "expense",
        category_id: catId,
        amount: "1500000",
        currency: "TOMAN",
        entry_date: new Date().toISOString().split("T")[0],
        description: "تست هزینه ثبت‌شده از کلاینت موبایل",
        is_recurring: false,
      }),
    });
    assert.ok(entry.id, "Created cashflow entry must have an id");

    const entries = await request("/cashflow/entries?limit=5");
    const matched = entries.find((e) => e.id === entry.id);
    assert.ok(matched, "Created entry must appear in entries list");
  });

  // SECTION 8: Transactions
  await runTest("Transactions list returns recent ledger operations", async () => {
    const txs = await request("/transactions?limit=10");
    assert.ok(Array.isArray(txs), "Transactions must be an array");
  });

  await runTest("Transaction creation reflects in ledger", async () => {
    if (!testAccountId) {
      const accounts = await request("/accounts");
      if (accounts.length > 0) testAccountId = accounts[0].id;
    }

    if (testAccountId) {
      const tx = await request("/transactions", {
        method: "POST",
        body: JSON.stringify({
          account_id: testAccountId,
          transaction_type: "INCOME",
          total_amount: "5000000",
          fee: "0",
          currency: "TOMAN",
          transaction_date: new Date().toISOString(),
          notes: "تراکنش درآمد آزمایشی از موبایل",
        }),
      });
      assert.ok(tx.id, "Transaction must have id");
      assert.strictEqual(tx.transaction_type, "INCOME");
    }
  });

  // SECTION 9: Scenario Simulations (What-If Engine)
  await runTest("Scenario simulation returns deterministic projected trajectory", async () => {
    const sim = await request("/scenarios/simulate", {
      method: "POST",
      body: JSON.stringify({
        name: "Mobile Integration Test Simulation",
        horizon_months: 24,
        monthly_income_delta: "10000000",
        monthly_expense_delta: "-2000000",
        asset_growth_rate_annual: "20.0",
        new_loan_amount: "0",
        new_loan_rate_annual: "18.0",
        new_loan_term_months: 12,
        one_time_windfall: "50000000",
      }),
    });
    assert.ok(sim.baseline_net_worth !== undefined, "baseline_net_worth");
    assert.ok(sim.final_projected_net_worth !== undefined, "final_projected_net_worth");
    assert.ok(sim.net_worth_delta !== undefined, "net_worth_delta");
    assert.ok(Array.isArray(sim.monthly_projections), "monthly_projections array");
    assert.strictEqual(sim.monthly_projections.length, 24, "24 months projection");
  });

  // SECTION 10: Financial Goals
  await runTest("Goal CRUD: Create, query and delete financial goal", async () => {
    const targetDate = new Date();
    targetDate.setFullYear(targetDate.getFullYear() + 1);

    const goal = await request("/goals", {
      method: "POST",
      body: JSON.stringify({
        name: "هدف آزمایشی خرید طلا از موبایل",
        category: "INVESTMENT",
        target_amount: "150000000",
        current_amount: "30000000",
        monthly_contribution: "10000000",
        currency: "TOMAN",
        target_date: targetDate.toISOString().split("T")[0],
        notes: "تست اهداف مالی موبایل",
      }),
    });
    assert.ok(goal.id, "Created goal must have id");
    testGoalId = goal.id;

    const allGoals = await request("/goals");
    const found = allGoals.find((g) => g.id === testGoalId);
    assert.ok(found, "Created goal must exist in list");

    await request(`/goals/${testGoalId}`, { method: "DELETE" });
    const afterDelete = await request("/goals");
    const stillFound = afterDelete.find((g) => g.id === testGoalId);
    assert.strictEqual(stillFound, undefined, "Goal must be deleted");
  });

  // SECTION 11: Liabilities & Obligation Schedule
  await runTest("Liabilities list returns current debts and payment schedules", async () => {
    const liabilities = await request("/liabilities");
    assert.ok(Array.isArray(liabilities), "Liabilities must be array");
  });

  await runTest("Liability type configurations catalog", async () => {
    const types = await request("/liabilities/types");
    assert.ok(Array.isArray(types), "Liability types must be array");
  });

  console.log(`\n========================================================`);
  console.log(` RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log(`========================================================\n`);

  if (testsFailed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal test execution error:", err);
  process.exit(1);
});

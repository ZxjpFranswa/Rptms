<template>
  <div class="p-4 sm:p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">Collection Reports & Financial Audits</h2>
        <p class="text-gray-600 mt-1">Generate comprehensive daily, monthly, annual, barangay, and OR register reports</p>
      </div>
      <button
        @click="exportCurrentReportCsv"
        :disabled="loading"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg shadow-sm transition disabled:opacity-50 text-sm"
      >
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export Report to CSV
      </button>
    </div>

    <!-- Report Type Tabs -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-2 sm:p-4">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tab in reportTabs"
          :key="tab.id"
          @click="activeTab = tab.id; loadReport()"
          :class="[
            'px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition flex items-center gap-2',
            activeTab === tab.id
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          ]"
        >
          <span>{{ tab.name }}</span>
        </button>
      </div>
    </div>

    <!-- Parameter Filters Bar -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
        <!-- Date Picker for Daily -->
        <div v-if="activeTab === 'daily'">
          <label class="block text-xs font-semibold text-gray-600 mb-1">Collection Date</label>
          <input
            v-model="filterDate"
            @change="loadReport"
            type="date"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
        </div>

        <!-- Month & Year for Monthly -->
        <template v-if="activeTab === 'monthly'">
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">Month</label>
            <select
              v-model.number="filterMonth"
              @change="loadReport"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option v-for="(m, idx) in monthNames" :key="idx" :value="idx + 1">{{ m }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">Year</label>
            <input
              v-model.number="filterYear"
              @change="loadReport"
              type="number"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>
        </template>

        <!-- Year for Annual, Barangay, TaxYear -->
        <div v-if="['annual', 'barangay', 'tax_year'].includes(activeTab)">
          <label class="block text-xs font-semibold text-gray-600 mb-1">Fiscal Year</label>
          <input
            v-model.number="filterYear"
            @change="loadReport"
            type="number"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
        </div>

        <!-- Date Range for OR Register -->
        <template v-if="activeTab === 'or_register'">
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">Start Date</label>
            <input
              v-model="filterStartDate"
              @change="loadReport"
              type="date"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">End Date</label>
            <input
              v-model="filterEndDate"
              @change="loadReport"
              type="date"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">Status</label>
            <select
              v-model="filterOrStatus"
              @change="loadReport"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Posted">Posted (Valid)</option>
              <option value="Cancelled">Cancelled (Voided)</option>
            </select>
          </div>
        </template>

        <!-- Barangay Filter (for daily/monthly/annual/register) -->
        <div v-if="['daily', 'monthly', 'annual', 'or_register'].includes(activeTab)">
          <label class="block text-xs font-semibold text-gray-600 mb-1">Barangay Filter</label>
          <select
            v-model="filterBarangay"
            @change="loadReport"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
          >
            <option value="">All Barangays</option>
            <option v-for="b in barangays" :key="b" :value="b">{{ b }}</option>
          </select>
        </div>

        <div>
          <button
            @click="loadReport"
            class="w-full px-4 py-2 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-lg font-semibold transition"
          >
            Refresh Report
          </button>
        </div>
      </div>
    </div>

    <!-- Summary Metrics (For Daily/Monthly/Annual) -->
    <div
      v-if="reportData?.summary"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
    >
      <div class="bg-white rounded-xl shadow-sm border border-emerald-200 p-4">
        <span class="text-xs font-semibold text-emerald-700 uppercase">Total Collected</span>
        <p class="text-2xl font-bold text-emerald-700 mt-1">₱{{ formatCurrency(reportData.summary.total_collected) }}</p>
        <span class="text-[11px] text-gray-500">{{ reportData.summary.total_transactions || 0 }} receipts</span>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <span class="text-xs font-semibold text-gray-600 uppercase">Basic Tax (1%)</span>
        <p class="text-xl font-bold text-gray-900 mt-1">₱{{ formatCurrency(reportData.summary.total_basic) }}</p>
        <span class="text-[11px] text-gray-500">General Fund</span>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <span class="text-xs font-semibold text-gray-600 uppercase">SEF Tax (1%)</span>
        <p class="text-xl font-bold text-gray-900 mt-1">₱{{ formatCurrency(reportData.summary.total_sef) }}</p>
        <span class="text-[11px] text-gray-500">Special Education Fund</span>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <span class="text-xs font-semibold text-amber-700 uppercase">Penalties</span>
        <p class="text-xl font-bold text-amber-700 mt-1">₱{{ formatCurrency(reportData.summary.total_penalty) }}</p>
        <span class="text-[11px] text-gray-500">Late interest</span>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <span class="text-xs font-semibold text-blue-700 uppercase">Discounts Granted</span>
        <p class="text-xl font-bold text-blue-700 mt-1">₱{{ formatCurrency(reportData.summary.total_discount) }}</p>
        <span class="text-[11px] text-gray-500">Advance & Prompt</span>
      </div>
    </div>

    <!-- Report Table Container -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div v-if="loading" class="p-12 text-center text-gray-500">
        <svg class="animate-spin h-8 w-8 mx-auto text-primary-600 mb-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        Generating report data...
      </div>

      <!-- TAB 1: DAILY REPORT -->
      <div v-else-if="activeTab === 'daily'">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 class="font-bold text-gray-900">Daily Collection Details for {{ formatDate(filterDate) }}</h3>
            <p class="text-xs text-gray-500">Breakdown of collections by transaction receipt</p>
          </div>
          <div class="text-xs text-gray-600 flex gap-4">
            <span>Cash: <strong>₱{{ formatCurrency(reportData?.summary?.cash_total) }}</strong></span>
            <span>Check: <strong>₱{{ formatCurrency(reportData?.summary?.check_total) }}</strong></span>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 uppercase">
                <th class="py-2.5 px-3">OR Number</th>
                <th class="py-2.5 px-3">Payor Name</th>
                <th class="py-2.5 px-3">TD Number</th>
                <th class="py-2.5 px-3">Barangay</th>
                <th class="py-2.5 px-3 text-right">Basic RPT</th>
                <th class="py-2.5 px-3 text-right">SEF</th>
                <th class="py-2.5 px-3 text-right">Penalties</th>
                <th class="py-2.5 px-3 text-right">Discounts</th>
                <th class="py-2.5 px-3 text-right">Net Amount</th>
                <th class="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="p in (reportData?.transactions || [])"
                :key="p.id"
                class="hover:bg-gray-50"
              >
                <td class="py-2.5 px-3 font-mono font-semibold text-primary-700">{{ p.or_number }}</td>
                <td class="py-2.5 px-3 font-medium text-gray-900">{{ p.payor_name }}</td>
                <td class="py-2.5 px-3 font-mono text-gray-600">{{ p.tax_declaration?.td_number || '-' }}</td>
                <td class="py-2.5 px-3 text-gray-600">{{ p.barangay }}</td>
                <td class="py-2.5 px-3 text-right font-medium">₱{{ formatCurrency(p.allocations?.reduce((acc: number, a: any) => acc + Number(a.basic_amount || 0), 0)) }}</td>
                <td class="py-2.5 px-3 text-right font-medium">₱{{ formatCurrency(p.allocations?.reduce((acc: number, a: any) => acc + Number(a.sef_amount || 0), 0)) }}</td>
                <td class="py-2.5 px-3 text-right text-amber-700">₱{{ formatCurrency(p.allocations?.reduce((acc: number, a: any) => acc + Number(a.penalty_amount || 0), 0)) }}</td>
                <td class="py-2.5 px-3 text-right text-blue-700">₱{{ formatCurrency(p.discount_amount) }}</td>
                <td class="py-2.5 px-3 text-right font-bold text-gray-900">₱{{ formatCurrency(p.amount_paid) }}</td>
                <td class="py-2.5 px-3 text-center">
                  <span
                    :class="[
                      'px-2 py-0.5 rounded text-[11px] font-semibold',
                      p.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                    ]"
                  >
                    {{ p.status }}
                  </span>
                </td>
              </tr>
              <tr v-if="!reportData?.transactions || reportData.transactions.length === 0">
                <td colspan="10" class="py-8 text-center text-gray-500">No transactions recorded for this date.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 2: MONTHLY REPORT -->
      <div v-else-if="activeTab === 'monthly'">
        <div class="p-4 border-b border-gray-200">
          <h3 class="font-bold text-gray-900">
            Monthly Collections for {{ monthNames[filterMonth - 1] }} {{ filterYear }}
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 uppercase">
                <th class="py-2.5 px-4">Date</th>
                <th class="py-2.5 px-4 text-center">OR Count</th>
                <th class="py-2.5 px-4 text-right">Basic RPT</th>
                <th class="py-2.5 px-4 text-right">SEF</th>
                <th class="py-2.5 px-4 text-right">Penalties</th>
                <th class="py-2.5 px-4 text-right">Discounts</th>
                <th class="py-2.5 px-4 text-right">Total Collection</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="d in (reportData?.daily_totals || [])" :key="d.date" class="hover:bg-gray-50">
                <td class="py-2.5 px-4 font-medium">{{ formatDate(d.date) }}</td>
                <td class="py-2.5 px-4 text-center">{{ d.transactions_count }}</td>
                <td class="py-2.5 px-4 text-right">₱{{ formatCurrency(d.basic) }}</td>
                <td class="py-2.5 px-4 text-right">₱{{ formatCurrency(d.sef) }}</td>
                <td class="py-2.5 px-4 text-right text-amber-700">₱{{ formatCurrency(d.penalty) }}</td>
                <td class="py-2.5 px-4 text-right text-blue-700">₱{{ formatCurrency(d.discount) }}</td>
                <td class="py-2.5 px-4 text-right font-bold text-emerald-700">₱{{ formatCurrency(d.total) }}</td>
              </tr>
              <tr v-if="!reportData?.daily_totals || reportData.daily_totals.length === 0">
                <td colspan="7" class="py-8 text-center text-gray-500">No collections for this month.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 3: ANNUAL REPORT -->
      <div v-else-if="activeTab === 'annual'">
        <div class="p-4 border-b border-gray-200">
          <h3 class="font-bold text-gray-900">Annual Collection Summary for Year {{ filterYear }}</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 uppercase">
                <th class="py-2.5 px-4">Month</th>
                <th class="py-2.5 px-4 text-center">Receipts</th>
                <th class="py-2.5 px-4 text-right">Basic RPT</th>
                <th class="py-2.5 px-4 text-right">SEF</th>
                <th class="py-2.5 px-4 text-right">Penalties</th>
                <th class="py-2.5 px-4 text-right">Discounts</th>
                <th class="py-2.5 px-4 text-right">Total Collection</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="m in (reportData?.monthly_totals || [])" :key="m.month" class="hover:bg-gray-50">
                <td class="py-2.5 px-4 font-semibold">{{ monthNames[m.month - 1] }}</td>
                <td class="py-2.5 px-4 text-center">{{ m.transactions_count }}</td>
                <td class="py-2.5 px-4 text-right">₱{{ formatCurrency(m.basic) }}</td>
                <td class="py-2.5 px-4 text-right">₱{{ formatCurrency(m.sef) }}</td>
                <td class="py-2.5 px-4 text-right text-amber-700">₱{{ formatCurrency(m.penalty) }}</td>
                <td class="py-2.5 px-4 text-right text-blue-700">₱{{ formatCurrency(m.discount) }}</td>
                <td class="py-2.5 px-4 text-right font-bold text-emerald-700">₱{{ formatCurrency(m.total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 4: BY BARANGAY -->
      <div v-else-if="activeTab === 'barangay'">
        <div class="p-4 border-b border-gray-200">
          <h3 class="font-bold text-gray-900">Collections by Barangay (Fiscal Year {{ filterYear }})</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 uppercase">
                <th class="py-2.5 px-4">Barangay</th>
                <th class="py-2.5 px-4 text-center">Transactions</th>
                <th class="py-2.5 px-4 text-right">Basic Share</th>
                <th class="py-2.5 px-4 text-right">SEF Share</th>
                <th class="py-2.5 px-4 text-right">Penalties</th>
                <th class="py-2.5 px-4 text-right">Total Remittance</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="b in (reportData || [])" :key="b.barangay" class="hover:bg-gray-50">
                <td class="py-2.5 px-4 font-semibold text-gray-900">{{ b.barangay }}</td>
                <td class="py-2.5 px-4 text-center">{{ b.count }}</td>
                <td class="py-2.5 px-4 text-right">₱{{ formatCurrency(b.basic) }}</td>
                <td class="py-2.5 px-4 text-right">₱{{ formatCurrency(b.sef) }}</td>
                <td class="py-2.5 px-4 text-right text-amber-700">₱{{ formatCurrency(b.penalty) }}</td>
                <td class="py-2.5 px-4 text-right font-bold text-emerald-700">₱{{ formatCurrency(b.total) }}</td>
              </tr>
              <tr v-if="!reportData || reportData.length === 0">
                <td colspan="6" class="py-8 text-center text-gray-500">No collections by barangay recorded.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 5: BY TAX YEAR -->
      <div v-else-if="activeTab === 'tax_year'">
        <div class="p-4 border-b border-gray-200">
          <h3 class="font-bold text-gray-900">Current vs Prior Delinquent Tax Year Collections (Collected in {{ filterYear }})</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 uppercase">
                <th class="py-2.5 px-4">Taxable Year Settled</th>
                <th class="py-2.5 px-4 text-center">Category</th>
                <th class="py-2.5 px-4 text-right">Basic RPT</th>
                <th class="py-2.5 px-4 text-right">SEF</th>
                <th class="py-2.5 px-4 text-right">Penalties</th>
                <th class="py-2.5 px-4 text-right">Total Collected</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="ty in (reportData || [])" :key="ty.taxable_year" class="hover:bg-gray-50">
                <td class="py-2.5 px-4 font-mono font-bold">{{ ty.taxable_year }}</td>
                <td class="py-2.5 px-4 text-center">
                  <span
                    :class="[
                      'px-2 py-0.5 rounded text-[11px] font-semibold',
                      ty.taxable_year === filterYear ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    ]"
                  >
                    {{ ty.taxable_year === filterYear ? 'Current Year' : 'Prior Delinquent' }}
                  </span>
                </td>
                <td class="py-2.5 px-4 text-right">₱{{ formatCurrency(ty.basic) }}</td>
                <td class="py-2.5 px-4 text-right">₱{{ formatCurrency(ty.sef) }}</td>
                <td class="py-2.5 px-4 text-right text-amber-700">₱{{ formatCurrency(ty.penalty) }}</td>
                <td class="py-2.5 px-4 text-right font-bold text-gray-900">₱{{ formatCurrency(ty.total) }}</td>
              </tr>
              <tr v-if="!reportData || reportData.length === 0">
                <td colspan="6" class="py-8 text-center text-gray-500">No collections grouped by tax year found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 6: OR REGISTER -->
      <div v-else-if="activeTab === 'or_register'">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="font-bold text-gray-900">Sequential Official Receipt Register</h3>
          <span class="text-xs text-gray-500">{{ (reportData?.receipts || []).length }} receipts</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 uppercase">
                <th class="py-2.5 px-3">Date</th>
                <th class="py-2.5 px-3">OR Number</th>
                <th class="py-2.5 px-3">Payor</th>
                <th class="py-2.5 px-3">Barangay</th>
                <th class="py-2.5 px-3">Method</th>
                <th class="py-2.5 px-3 text-right">Gross Due</th>
                <th class="py-2.5 px-3 text-right">Discount</th>
                <th class="py-2.5 px-3 text-right">Amount Paid</th>
                <th class="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="r in (reportData?.receipts || [])" :key="r.id" class="hover:bg-gray-50">
                <td class="py-2.5 px-3">{{ formatDate(r.payment_date) }}</td>
                <td class="py-2.5 px-3 font-mono font-bold text-primary-700">{{ r.or_number }}</td>
                <td class="py-2.5 px-3 font-medium">{{ r.payor_name }}</td>
                <td class="py-2.5 px-3">{{ r.barangay }}</td>
                <td class="py-2.5 px-3">{{ r.payment_method }}</td>
                <td class="py-2.5 px-3 text-right">₱{{ formatCurrency(r.amount_due) }}</td>
                <td class="py-2.5 px-3 text-right text-blue-700">₱{{ formatCurrency(r.discount_amount) }}</td>
                <td class="py-2.5 px-3 text-right font-bold text-emerald-700">₱{{ formatCurrency(r.amount_paid) }}</td>
                <td class="py-2.5 px-3 text-center">
                  <span
                    :class="[
                      'px-2 py-0.5 rounded text-[11px] font-semibold',
                      r.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                    ]"
                  >
                    {{ r.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  fetchDailyReport,
  fetchMonthlyReport,
  fetchAnnualReport,
  fetchBarangayReport,
  fetchTaxYearReport,
  fetchReceiptRegister,
} from '@/services/billingApi'

const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1
const todayStr = now.toISOString().split('T')[0]

const activeTab = ref('daily')
const loading = ref(false)
const reportData = ref<any>(null)

const filterDate = ref(todayStr)
const filterMonth = ref(currentMonth)
const filterYear = ref(currentYear)
const filterBarangay = ref('')
const filterStartDate = ref(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0])
const filterEndDate = ref(todayStr)
const filterOrStatus = ref('')

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const barangays = [
  'Barangay Poblacion',
  'Barangay San Juan',
  'Barangay Santa Maria',
  'Barangay San Pedro',
  'Barangay San Isidro',
]

const reportTabs = [
  { id: 'daily', name: 'Daily Collection' },
  { id: 'monthly', name: 'Monthly Summary' },
  { id: 'annual', name: 'Annual Report' },
  { id: 'barangay', name: 'By Barangay Share' },
  { id: 'tax_year', name: 'By Tax Year' },
  { id: 'or_register', name: 'Official Receipt Register' },
]

const loadReport = async () => {
  loading.value = true
  reportData.value = null
  try {
    if (activeTab.value === 'daily') {
      reportData.value = await fetchDailyReport(filterDate.value, filterBarangay.value || undefined)
    } else if (activeTab.value === 'monthly') {
      reportData.value = await fetchMonthlyReport(filterYear.value, filterMonth.value, filterBarangay.value || undefined)
    } else if (activeTab.value === 'annual') {
      reportData.value = await fetchAnnualReport(filterYear.value, filterBarangay.value || undefined)
    } else if (activeTab.value === 'barangay') {
      reportData.value = await fetchBarangayReport(filterYear.value)
    } else if (activeTab.value === 'tax_year') {
      reportData.value = await fetchTaxYearReport(filterYear.value)
    } else if (activeTab.value === 'or_register') {
      reportData.value = await fetchReceiptRegister({
        status: filterOrStatus.value || undefined,
        barangay: filterBarangay.value || undefined,
        start_date: filterStartDate.value,
        end_date: filterEndDate.value,
      })
    }
  } catch (err) {
    console.error('Failed to load report:', err)
  } finally {
    loading.value = false
  }
}

const exportCurrentReportCsv = () => {
  let headers: string[] = []
  let rows: string[][] = []
  const title = `Report_${activeTab.value}_${todayStr}`

  if (activeTab.value === 'daily') {
    headers = ['OR Number', 'Payor Name', 'TD Number', 'Barangay', 'Amount Paid', 'Discount', 'Status']
    rows = (reportData.value?.transactions || []).map((t: any) => [
      `"${t.or_number}"`,
      `"${t.payor_name}"`,
      `"${t.tax_declaration?.td_number || ''}"`,
      `"${t.barangay}"`,
      Number(t.amount_paid).toFixed(2),
      Number(t.discount_amount).toFixed(2),
      `"${t.status}"`
    ])
  } else if (activeTab.value === 'or_register') {
    headers = ['Date', 'OR Number', 'Payor Name', 'Barangay', 'Method', 'Amount Due', 'Discount', 'Amount Paid', 'Status']
    rows = (reportData.value?.receipts || []).map((r: any) => [
      `"${r.payment_date}"`,
      `"${r.or_number}"`,
      `"${r.payor_name}"`,
      `"${r.barangay}"`,
      `"${r.payment_method}"`,
      Number(r.amount_due).toFixed(2),
      Number(r.discount_amount).toFixed(2),
      Number(r.amount_paid).toFixed(2),
      `"${r.status}"`
    ])
  } else {
    headers = ['Category', 'Value']
    rows = [['Total Collected', Number(reportData.value?.summary?.total_collected || 0).toFixed(2)]]
  }

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const formatCurrency = (val?: number) => {
  if (val === undefined || val === null) return '0.00'
  return Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(() => {
  loadReport()
})
</script>

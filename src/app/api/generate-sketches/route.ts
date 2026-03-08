import { NextResponse } from 'next/server';

const MOCK_A = `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 font-sans p-6 text-gray-800">
  <div class="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="p-6 border-b border-gray-100 flex justify-between items-center">
      <h1 class="text-xl font-semibold">Inventory</h1>
      <span class="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">3 Low Stock</span>
    </div>
    <div class="p-6 space-y-4">
      <div class="flex justify-between items-center pb-4 border-b border-gray-50">
        <div>
          <p class="font-medium">Widgets Pro</p>
          <p class="text-xs text-gray-500">ID: W-239</p>
        </div>
        <div class="text-right">
          <p class="text-2xl font-bold text-red-500">4</p>
          <p class="text-xs text-red-500">Reorder!</p>
        </div>
      </div>
      <div class="flex justify-between items-center pb-4 border-b border-gray-50">
        <div>
          <p class="font-medium">Super Gizmos</p>
          <p class="text-xs text-gray-500">ID: G-881</p>
        </div>
        <div class="text-right">
          <p class="text-2xl font-bold text-green-500">142</p>
          <p class="text-xs text-gray-400">Stable</p>
        </div>
      </div>
    </div>
    <div class="p-4 bg-gray-50 text-center">
      <button onclick="alert('Scan barcode clicked')" class="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition">Scan Item</button>
    </div>
  </div>
</body>
</html>`;

const MOCK_B = `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 font-sans p-4 text-slate-100 min-h-screen">
  <div class="max-w-4xl mx-auto space-y-6">
    <header class="flex justify-between items-end border-b border-slate-700 pb-4">
      <div>
        <h1 class="text-2xl font-bold">Data Control Center</h1>
        <p class="text-slate-400 text-sm">Last updated: Just now</p>
      </div>
      <div class="flex gap-2">
        <select class="bg-slate-800 border-none text-sm px-4 py-2 rounded-lg text-white outline-none">
          <option>All Warehouses</option>
          <option>North Facility</option>
        </select>
        <button class="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium transition">Export CSV</button>
      </div>
    </header>
    
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
        <p class="text-slate-400 text-sm mb-1">Total Value</p>
        <p class="text-3xl font-bold">$1.24M</p>
        <p class="text-emerald-400 text-xs mt-2">↑ 2.4% vs last week</p>
      </div>
      <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
        <p class="text-slate-400 text-sm mb-1">Critical Stock Items</p>
        <p class="text-3xl font-bold text-rose-400">12</p>
      </div>
      <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
        <p class="text-slate-400 text-sm mb-1">Incoming Shipments</p>
        <p class="text-3xl font-bold text-sky-400">5</p>
      </div>
    </div>

    <div class="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-900 text-slate-400">
          <tr>
            <th class="p-4 font-medium">SKU / Item</th>
            <th class="p-4 font-medium">Category</th>
            <th class="p-4 font-medium text-right">Qty</th>
            <th class="p-4 font-medium text-right">Status</th>
            <th class="p-4"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-700">
          <tr class="hover:bg-slate-700/50 transition">
            <td class="p-4"><span class="block font-medium">Bolt 5mm</span><span class="text-xs text-slate-400">HW-B-05</span></td>
            <td class="p-4">Hardware</td>
            <td class="p-4 text-right">4,200</td>
            <td class="p-4 text-right"><span class="bg-emerald-400/10 text-emerald-400 px-2 py-1 rounded text-xs">Healthy</span></td>
            <td class="p-4 text-right"><button class="text-indigo-400 hover:text-indigo-300">Edit</button></td>
          </tr>
          <tr class="hover:bg-slate-700/50 transition bg-rose-500/5">
            <td class="p-4"><span class="block font-medium">Processor XYZ</span><span class="text-xs text-slate-400">EL-P-XYZ</span></td>
            <td class="p-4">Electronics</td>
            <td class="p-4 text-right font-bold text-rose-400">2</td>
            <td class="p-4 text-right"><span class="bg-rose-400/10 text-rose-400 px-2 py-1 rounded text-xs animate-pulse">Critical</span></td>
            <td class="p-4 text-right"><button class="text-indigo-400 hover:text-indigo-300">Order</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;

const MOCK_C = `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
</head>
<body class="bg-gray-100 font-sans text-gray-900 m-0 p-0 h-screen flex justify-center">
  <div class="w-full max-w-sm bg-white h-full shadow-2xl relative flex flex-col">
    <!-- Header -->
    <header class="bg-blue-600 text-white p-4 pt-8 sticky top-0 z-10 shadow-md">
      <div class="flex justify-between items-center">
        <div class="w-8 h-8 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </div>
        <h1 class="text-lg font-bold">Field App</h1>
        <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">JM</div>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
      
      <!-- Scan CTA -->
      <button onclick="alert('Camera opened!')" class="w-full bg-gray-900 text-white p-4 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
        <span class="font-bold text-lg">Tap to Scan Barcode</span>
      </button>

      <!-- Quick Stats -->
      <div class="flex gap-4">
        <div class="flex-1 bg-blue-50 p-4 rounded-2xl border border-blue-100">
          <p class="text-blue-600 text-xs font-bold mb-1 uppercase tracking-wider">To Restock</p>
          <p class="text-2xl font-black text-blue-900">8<span class="text-sm font-normal text-blue-400 ml-1">items</span></p>
        </div>
        <div class="flex-1 bg-green-50 p-4 rounded-2xl border border-green-100">
          <p class="text-green-600 text-xs font-bold mb-1 uppercase tracking-wider">Completed</p>
          <p class="text-2xl font-black text-green-900">42<span class="text-sm font-normal text-green-400 ml-1">today</span></p>
        </div>
      </div>

    </main>

    <!-- Bottom Nav -->
    <nav class="bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center absolute bottom-0 w-full">
      <div class="text-blue-600 flex flex-col items-center p-2">
        <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
        <span class="text-[10px] font-bold">Home</span>
      </div>
      <div class="text-gray-400 hover:text-blue-600 transition flex flex-col items-center p-2">
        <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
        <span class="text-[10px] font-bold">Tasks</span>
      </div>
      <div class="text-gray-400 hover:text-blue-600 transition flex flex-col items-center p-2">
        <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
        <span class="text-[10px] font-bold">Profile</span>
      </div>
    </nav>
  </div>
</body>
</html>`;

export async function POST(request: Request) {
    try {
        const { goal, structuredData } = await request.json();

        if (!goal || !structuredData) {
            return NextResponse.json({ error: 'Goal and structured data are required' }, { status: 400 });
        }

        // Simulate longer network delay for sketch generation
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Array of mock sketches
        return NextResponse.json({
            sketchA: MOCK_A,
            sketchB: MOCK_B,
            sketchC: MOCK_C
        });

    } catch (error) {
        console.error("Error generating sketches:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

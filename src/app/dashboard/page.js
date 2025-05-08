'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    setError(null);
    supabase
      .from('order_with_profile')
      .select('*')
      .order('pickup_date', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setOrders(data || []);
        setFetching(false);
      });
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const filteredOrders = useMemo(() => {
    if (!search) return orders;
    const s = search.toLowerCase();
    return orders.filter((order) => {
      return (
        `${order.first_name} ${order.last_name}`.toLowerCase().includes(s) ||
        (order.phone_number || '').toLowerCase().includes(s) ||
        (order.tonnage + '').includes(s) ||
        (order.pickup_street_address || '').toLowerCase().includes(s) ||
        (order.pickup_city || '').toLowerCase().includes(s) ||
        (order.pickup_state || '').toLowerCase().includes(s) ||
        (order.pickup_zip_code || '').toLowerCase().includes(s) ||
        (order.dropoff_street_address || '').toLowerCase().includes(s) ||
        (order.dropoff_city || '').toLowerCase().includes(s) ||
        (order.dropoff_state || '').toLowerCase().includes(s) ||
        (order.dropoff_zip_code || '').toLowerCase().includes(s)
      );
    });
  }, [orders, search]);

  // Helper to format date and time as 'MM/DD/YYYY at HH:MM AM/PM'
  function formatDateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return '';
    const date = new Date(dateStr + 'T' + timeStr);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${mm}/${dd}/${yyyy} at ${hours}:${minutes} ${ampm}`;
  }

  // Helper to format phone number as XXX-XXX-XXXX
  function formatPhoneNumber(phone) {
    if (!phone) return '';
    // Remove non-digits
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone; // fallback to original if not 10 digits
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trucking Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Orders</h2>
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
        <div className="overflow-x-auto rounded-lg shadow bg-white dark:bg-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Driver</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tonnage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Picked Up</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pick Up Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dropped Off</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Drop Off Address</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {fetching ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">Loading orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">No orders found.</td></tr>
              ) : (
                filteredOrders.map(order => {
                  const pickupAddress = `${order.pickup_street_address}, ${order.pickup_city}, ${order.pickup_state} ${order.pickup_zip_code}`;
                  const dropoffAddress = `${order.dropoff_street_address}, ${order.dropoff_city}, ${order.dropoff_state} ${order.dropoff_zip_code}`;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-2 whitespace-nowrap">{order.first_name} {order.last_name}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{formatPhoneNumber(order.phone_number)}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{order.tonnage}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{formatDateTime(order.pickup_date, order.pickup_time)}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{pickupAddress}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{formatDateTime(order.dropoff_date, order.dropoff_time)}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{dropoffAddress}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
} 
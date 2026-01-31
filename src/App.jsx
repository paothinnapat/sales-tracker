import SalesForm from './components/SalesForm';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-retail">
      <div className="mx-auto max-w-xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Daily Sales Tracker
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Efficiently record and track your store's daily transactions.
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-sm rounded-xl sm:px-10 border border-gray-100 ring-1 ring-black/5">
          <SalesForm />
        </div>

        <div className="mt-8 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Clothing Store Inc.
        </div>
      </div>
    </div>
  );
}

export default App;

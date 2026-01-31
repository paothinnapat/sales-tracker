import { useState, useEffect } from 'react';

export default function SalesForm() {
    const PRODUCTS = [
        { name: 'Shirt', variants: [180, 200, 250, 300] },
        { name: 'Pant', variants: [180, 200, 250, 300, 350, 390] },
        { name: 'Short', variants: [300, 290, 250, 230, 200] },
        { name: 'Skirt', variants: [600, 550, 500, 450, 400, 350, 300, 290, 250] },
        { name: 'Set', variants: [490, 390, 350] },
        { name: 'Dress', variants: [450, 400, 350, 300, 250] },
        { name: 'Men_Shirt', variants: [490, 450, 400, 390, 350] },
        { name: 'Men_Pant', variants: [590, 550, 500, 490, 450, 400] },
        { name: 'Men_Short', variants: [390, 350, 300] }
    ];

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        store: '410',
    });

    // quantitiesKey: `${productName}-${price}`
    const [quantities, setQuantities] = useState({});
    const [total, setTotal] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleGlobalChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleQuantityChange = (productName, price, delta) => {
        const key = `${productName}-${price}`;
        setQuantities(prev => {
            const currentQty = prev[key] || 0;
            const newQty = Math.max(0, currentQty + delta);
            return {
                ...prev,
                [key]: newQty
            };
        });
    };

    const handleExactQuantityChange = (productName, price, value) => {
        const key = `${productName}-${price}`;
        const newQty = Math.max(0, parseInt(value) || 0);
        setQuantities(prev => ({
            ...prev,
            [key]: newQty
        }));
    };

    useEffect(() => {
        let newTotal = 0;
        PRODUCTS.forEach(product => {
            product.variants.forEach(price => {
                const key = `${product.name}-${price}`;
                const qty = quantities[key] || 0;
                newTotal += qty * price;
            });
        });
        setTotal(newTotal);
    }, [quantities]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const items = [];
        PRODUCTS.forEach(product => {
            product.variants.forEach(price => {
                const key = `${product.name}-${price}`;
                const qty = quantities[key] || 0;
                if (qty > 0) {
                    items.push({
                        product: product.name,
                        price: price,
                        quantity: qty,
                        subtotal: qty * price
                    });
                }
            });
        });

        const submission = {
            ...formData,
            items,
            total
        };

        console.log('Form Submitted:', submission);
        if (items.length === 0) {
            alert('Please add at least one item to the cart.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/submit-sale', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submission),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to submit sale');
            }

            alert(`Sale recorded successfully! Total: ${total} THB`);
            // Optional: Reset form or redirect
            setQuantities({});
            setTotal(0);
        } catch (error) {
            console.error('Submission error:', error);
            alert(`Error recording sale: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Global Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-100">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleGlobalChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-800 focus:ring-gray-800 sm:text-sm p-2.5 border transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Plant</label>
                    <select
                        name="store"
                        value={formData.store}
                        onChange={handleGlobalChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-800 focus:ring-gray-800 sm:text-sm p-2.5 border transition-colors bg-white"
                    >
                        <option value="410">410</option>
                        <option value="658">658</option>
                        <option value="659">659</option>
                        <option value="1181">1181</option>
                    </select>
                </div>
            </div>

            {/* Products List */}
            <div className="space-y-8">
                {PRODUCTS.map((product) => (
                    <div key={product.name} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            {product.variants.map((price) => {
                                const key = `${product.name}-${price}`;
                                const qty = quantities[key] || 0;
                                return (
                                    <div key={price} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-500">Price</span>
                                            <span className="text-base font-semibold text-gray-900">{price} ฿</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleQuantityChange(product.name, price, -10)}
                                                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors text-xs font-medium"
                                            >
                                                -10
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleQuantityChange(product.name, price, -1)}
                                                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors text-lg"
                                            >
                                                -
                                            </button>

                                            <input
                                                type="number"
                                                min="0"
                                                value={qty}
                                                onChange={(e) => handleExactQuantityChange(product.name, price, e.target.value)}
                                                className="w-16 text-center rounded-lg border-gray-300 shadow-sm focus:border-gray-800 focus:ring-gray-800 sm:text-sm p-2.5 border"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => handleQuantityChange(product.name, price, 1)}
                                                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors text-lg"
                                            >
                                                +
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleQuantityChange(product.name, price, 10)}
                                                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors text-xs font-medium"
                                            >
                                                +10
                                            </button>
                                        </div>

                                        <div className="text-right">
                                            <span className="block text-xs text-gray-400">Subtotal</span>
                                            <span className="block text-sm font-medium text-gray-900">
                                                {(qty * price).toLocaleString()} ฿
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer / Total */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] rounded-t-xl z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center md:text-left">
                        <span className="block text-sm text-gray-500">Total Amount</span>
                        <span className="text-3xl font-bold text-gray-900">{total.toLocaleString()} ฿</span>
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full md:w-auto px-8 py-3 rounded-xl font-semibold shadow-lg transform transition-all duration-200 ${isSubmitting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5'
                            }`}
                    >
                        {isSubmitting ? 'Recording...' : 'Confirm Sale'}
                    </button>
                </div>
            </div>
        </form>
    );
}

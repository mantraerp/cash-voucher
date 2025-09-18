// Copyright (c) 2025, mantra softec (india) pvt. ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on("Cash Voucher Type", {
	refresh(frm) {
        frm.set_query('expense_acccount', function() {
            return {
                filters: {
                    root_type: 'Expense',
                    is_group : 0
                }
            };
        }); 
	},
});

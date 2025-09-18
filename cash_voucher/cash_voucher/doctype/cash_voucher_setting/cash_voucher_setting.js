// Copyright (c) 2025, mantra softec (india) pvt. ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on("Cash Voucher Setting", {
	refresh(frm) {
        frm.set_query('cash_account', function() {
            return {
                filters: {
                    account_type: 'Cash',
                }
            };
        }); 
	},
});

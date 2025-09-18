// Copyright (c) 2025, mantra softec (india) pvt. ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on("Cash Voucher", {
	// refresh(frm) {

	// },
});
frappe.ui.form.on('Cash Voucher Item', {
    voucher_type : function(frm, cdt, cdn) {
        var row = locals[cdt][cdn];
        if (row.voucher_type){
            frappe.call({
				method : 'frappe.client.get',
				args : {
					doctype : "Cash Voucher Type",
					name : row.voucher_type
				},
				callback : function(r){
					var res = r.message
					if(res){
						frappe.model.set_value(cdt, cdn, "expense_account", res.expense_acccount)
                        frappe.model.set_value(cdt, cdn, "cash_account", res.cash_account)
					}
				}
			})
        }else{
            frappe.model.set_value(cdt, cdn, "expense_account", '')
             frappe.model.set_value(cdt, cdn, "cash_account", '')
        }
    },
    amount : function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];

        let total_amount = 0;
        frm.doc.voucher.forEach(function(d) {
            total_amount += d.amount || 0 
        })
        frm.set_value("total_amount", total_amount);
        frm.refresh_field("voucher");
    }
})
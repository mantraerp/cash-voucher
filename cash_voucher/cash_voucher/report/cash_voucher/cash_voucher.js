// Copyright (c) 2025, mantra softec (india) pvt. ltd. and contributors
// For license information, please see license.txt

frappe.query_reports["Cash Voucher"] = {
	"filters": [
		{
            "fieldname": "from_date",
            "label": "From Date",
            "fieldtype": "Date",
            "reqd": 1
        },
		{
            "fieldname": "to_date",
            "label": "To Date",
            "fieldtype": "Date",
            "reqd": 1
        }
	]
};

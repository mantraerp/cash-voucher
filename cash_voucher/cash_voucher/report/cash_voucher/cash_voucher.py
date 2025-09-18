# Copyright (c) 2025, mantra softec (india) pvt. ltd. and contributors
# For license information, please see license.txt

import frappe

def execute(filters=None):
	if not filters:
		filters = {}

	columns = get_columns()
	data = get_data(filters)
	return columns, data

def get_columns():
	columns = []
	
	columns.append({"label": "Voucher Type", "fieldname": "voucher_type", "fieldtype": "Data", "width": 610}),
	columns.append({"label": "Total Amount", "fieldname": "total_amount", "fieldtype": "Currency", "width": 610})

	return columns

def get_data(filters):
	conditions = ''
	values = {}

	if filters.get("from_date"):
		conditions += " AND cvi.voucher_date >= %(from_date)s"
		values["from_date"] = filters["from_date"]
	
	if filters.get("to_date"):
		conditions += " AND cvi.voucher_date <= %(to_date)s"
		values["to_date"] = filters["to_date"]
	
	query = f"""SELECT cvi.voucher_type, SUM(cvi.amount) as total_amount FROM `tabCash Voucher Item` cvi INNER JOIN `tabCash Voucher` cv ON cv.name = cvi.parent WHERE cv.docstatus = 1 {conditions} GROUP BY cvi.voucher_type"""
	results = frappe.db.sql(query,values,as_dict=True)

	return results
# Copyright (c) 2025, mantra softec (india) pvt. ltd. and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import getdate
from frappe import _

class CashVoucher(Document):
	# def before_save(self):
	# 	self.share_document()

	def validate(self):
		seen = {}
		today = getdate()

		for idx, row in enumerate(self.voucher, start=1):
			if row.voucher_type in seen:
				frappe.throw(_("Voucher Type {0} is duplicate in row {1}").format(row.voucher_type, idx))
			else:
				seen[row.voucher_type] = idx

			if row.voucher_date and getdate(row.voucher_date) > today:
				frappe.throw(_("Voucher Date {0} in row {1} cannot be greater than today").format(row.voucher_date, idx))


	def before_submit(self):
		je = frappe.new_doc("Journal Entry")
		je.voucher_type = "Expense"
		je.company = self.company
		je.posting_date = getdate()
		je.user_remark = "Cash entry for the cash amount"
		je.cheque_no = self.name
		je.cheque_date = getdate()

		for i in self.voucher:
			je_item = frappe.new_doc("Journal Entry Account")
			je_item.account = i.expense_account
			je_item.debit_in_account_currency = i.amount
			je.append("accounts",je_item)
		
		cash_account = ''
		total_amount = self.total_amount
		default_cash_account = frappe.db.get_value("Company", self.company, 'default_cash_account')
		
		if default_cash_account:
			cash_account = default_cash_account
		else:
			cash_account = frappe.db.get_single_value("Cash Voucher Setting","cash_account")

		if not cash_account:
			frappe.trow("Please set the cash account in the Cash Voucher Setting Or in the Company")
		
		je.append("accounts",{
			"account": cash_account,
			"credit_in_account_currency" : total_amount
		})

		je.save(ignore_permissions=True)
		je.submit()

	def share_document(self):
		if not self.first_approver:
			return 

		frappe.share.add(
			doctype=self.doctype,
			name=self.name,
			user = self.first_approver,
			read = 1,
			write = 1,
			submit = 1,
			share = 1,
			notify = 1
		)
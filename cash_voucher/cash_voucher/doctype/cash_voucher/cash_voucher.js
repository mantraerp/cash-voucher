// Copyright (c) 2025, mantra softec (india) pvt. ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on("Cash Voucher", {
    refresh: function (frm) {
        if (!frm.doc.__islocal) {
            frm.add_custom_button("Preview Voucher", () => {
                let d = new frappe.ui.Dialog({
                    title: 'Cash Voucher Preview',
                    size: 'large',
                    fields: [
                        {
                            fieldtype: 'HTML',
                            fieldname: 'voucher_html'
                        }
                    ],
                    primary_action_label: 'Print Voucher',
                    primary_action: function () {
                        let html = generateVoucherHTML(frm.doc);
                        let printWindow = window.open("", "_blank");
                        printWindow.document.writeln(html);
                        printWindow.document.close();
                        printWindow.print();
                        printWindow.close()
                        d.hide();
                    }
                });

                d.show();
                d.fields_dict.voucher_html.$wrapper.html(generateVoucherHTML(frm.doc));
                console.log(d.fields_dict.voucher_html.$wrapper.find('.title').css({'position': 'unset !important', 'left': '0', 'top': '0'}));
                d.fields_dict.voucher_html.$wrapper.find('*').each(function () {
                    $(this).css('color', 'black');
                });
                d.fields_dict.voucher_html.$wrapper.css({
                    'background-color': 'white',
                });

            });
        }
        frm.set_query('party_type', function () {
            return {
                filters: {
                    name: 'Employee',
                }
            };
        });
        frm.add_fetch('party', 'employee_name', 'party_name')
    }
});
frappe.ui.form.on('Cash Voucher Item', {
    voucher_type: function (frm, cdt, cdn) {
        var row = locals[cdt][cdn];
        if (row.voucher_type) {
            frappe.call({
                method: 'frappe.client.get',
                args: {
                    doctype: "Cash Voucher Type",
                    name: row.voucher_type
                },
                callback: function (r) {
                    var res = r.message
                    if (res) {
                        frappe.model.set_value(cdt, cdn, "expense_account", res.expense_acccount)
                        frappe.model.set_value(cdt, cdn, "cash_account", res.cash_account)
                    }
                }
            })
        } else {
            frappe.model.set_value(cdt, cdn, "expense_account", '')
            frappe.model.set_value(cdt, cdn, "cash_account", '')
        }
    },
    amount: function (frm, cdt, cdn) {
        let row = locals[cdt][cdn];

        let total_amount = 0;
        frm.doc.voucher.forEach(function (d) {
            total_amount += d.amount || 0
        })
        frm.set_value("total_amount", total_amount);
        frm.refresh_field("voucher");
    }
})

function generateVoucherHTML(doc) {
    // Format date
    function formatDate(dateStr) {
        if (!dateStr) return "";
        let d = new Date(dateStr);
        return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
    }

    // Build expense rows
    let expenseRows = "";
    let expenses = doc.voucher || [];
    expenses.forEach((exp, idx) => {
        expenseRows += `
            <tr>
                <td>${idx + 1}</td>
                <td>${exp.voucher_type || ''}${exp.voucher_type ? ' - ' + exp.voucher_type : ''}</td>
                <td style="text-align: right;">₹ ${parseFloat(exp.amount || 0).toFixed(2)}</td>
            </tr>
        `;
    });


    let amountInWords = doc.total_amount_in_words || toWords(doc.total_amount || 0);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Cash Voucher - ${doc.name}</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: white;
            font-color: #000;
        }
        .voucher {
            border: 2px solid #ff3b30;
            border-radius: 8px;
            padding: 15px;
            max-width: 800px;
            margin: auto;
            box-sizing: border-box;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .company-name {
            font-size: 15px;
            font-weight: bold;
            color: #000;
        }
        .iso-cert {
            font-size: 10px;
            color: #000;
        }
        .logo-container {
            width: 120px;
            height: 45px;
            text-align: right;
        }
        .logo-img {
            margin-top: 9px;
            width: 100%;
            height: auto;
        }
        .title {
            background-color: #ff3b30;
            -webkit-print-color-adjust: exact !important;
            color: white;
            border-radius: 5px;
            font-size: 15px;
            font-weight: bold;
            text-align: center;
            margin: 0 auto;
            width: 150px;
            position: fixed !important;
            align-items: center;
            left: 325px;
            top: 20px;
        }
        .row {
            display: flex;
            margin-bottom: 5px;
            font-size: 14px;
        }
        .label {
            font-weight: bold;
            min-width: 37px;
            padding-right: 5px;
        }
        .value {
            flex-grow: 1;
            border-bottom: 1px solid #ff3b30;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .table th,
        .table td {
            border: 1px solid #ff3b30;
            padding: 6px;
            text-align: left;
        }
        .table th {
            background-color: #f7d5d5 !important;
            font-weight: normal;
            -webkit-print-color-adjust: exact !important;
            text-align : center;
        }
        .total-row {
            font-weight: bold;
            background-color: #f7d5d5 !important;
            -webkit-print-color-adjust: exact !important;
        }
        .amount-in-words {
            padding: 5px;
            margin-top: 5px;
            font-weight: semi-bold;
        }
        .footer {
            margin-top: 15px;
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            color: #000;
        }
        .signature {
            width: 30%;
            text-align: center;
        }
        .signature-line {
            border-top: 1px solid #000;
            margin-top: 15px;
            padding-top: 5px;
        }
    </style>
</head>
<body>

<div class="voucher">
    <div class="title">CASH VOUCHER</div>
    <!-- Header -->
    <div class="header">
        <div>
            <div class="company-name">MANTRA SOFTECH (INDIA) PVT LTD.</div>
            <div class="iso-cert">ISO 9001 : 2008 COMPANY</div>
        </div>
        <div ></div>
        <div class="logo-container">
            <img src="/files/company_print_logo.png" alt="Company Logo" class="logo-img">
        </div>
    </div>

    <div class="row">
        <div class="label">Pay to:</div>
        <div class="value">${doc.party_name || ''}</div>
        <div class="label">Voucher No.:</div>
        <div class="value">${doc.name}</div>
    </div>

    <div class="row">
        <div class="label">Debit:</div>
        <div class="value">₹ ${parseFloat(doc.total_amount || 0).toFixed(2)}</div>
        <div class="label">Branch Name:</div>
        <div class="value">${doc.branch || ''}</div>
        <div class="label">Date:</div>
        <div class="value">${formatDate(doc.creation)}</div>
    </div>

    <!-- Expense Table -->
    <table class="table">
        <thead>
            <tr>
                <th >Sr.No</th>
                <th>Expense Details</th>
                <th>Amt in Rs</th>
            </tr>
        </thead>
        <tbody>
            ${expenseRows}
        </tbody>
        <tfoot>
            <tr class="total-row">
                <td colspan="2" style="text-align: right; font-weight: bold;">Total</td>
                <td style="text-align: right; font-weight: bold;">₹ ${parseFloat(doc.total_amount || 0).toFixed(2)}</td>
            </tr>
            <tr class="amount-in-words">
                <td colspan="3"><span style="background-color: #f7d5d5 !important;
            -webkit-print-color-adjust: exact !important; height: 100%;">Amount in Words: ${amountInWords}</span></td>
            </tr>
        </tfoot>
    </table>

    <!-- Total in Words -->
    

    <!-- Signatures -->
    <div class="footer">
        <div class="signature"><br><br>
            Authorised Signature
        </div>
        <div class="signature"><br><br>
            Approved by
        </div>
        <div class="signature"><br><br>
            Receiver's Signature<br>
        </div>
    </div>
</div>

</body>
</html>
    `;
}

// generate function to convert simple number to words (indian rupees)
function toWords(num) {
    if (num === 0) return "Zero";

    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const scales = ["", "Thousand", "Lakh", "Crore"];

    function convertLessThanThousand(n) {
        let word = "";
        if (n >= 100) {
            word += ones[Math.floor(n / 100)] + " Hundred ";
            n %= 100;
        }
        if (n >= 20) {
            word += tens[Math.floor(n / 10)] + " ";
            n %= 10;
        } else if (n >= 10) {
            word += teens[n - 10] + " ";
            n = 0;
        }
        if (n > 0) {
            word += ones[n] + " ";
        }
        return word;
    }

    let words = "";
    let crore = Math.floor(num / 10000000);
    let lakh = Math.floor((num % 10000000) / 100000);
    let thousand = Math.floor((num % 100000) / 1000);
    let remainder = num % 1000;

    if (crore > 0) words += convertLessThanThousand(crore) + "Crore ";
    if (lakh > 0) words += convertLessThanThousand(lakh) + "Lakh ";
    if (thousand > 0) words += convertLessThanThousand(thousand) + "Thousand ";
    if (remainder > 0) words += convertLessThanThousand(remainder);

    return words.trim() + " Only";
}
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { SidebarComponent } from "../../layouts/sidebar/sidebar.component";
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as monaco from 'monaco-editor';
import { MonacoEditorModule } from 'ngx-monaco-editor';

@Component({
  selector: 'app-voucher-details',
  imports: [CommonModule, FormsModule, SidebarComponent, MonacoEditorModule],
  templateUrl: './voucher-details.component.html',
  styleUrl: './voucher-details.component.scss'
})
export class VoucherDetailsComponent {
  @ViewChild('editorContainer') editorContainer!: ElementRef;
  
  activeTab: string = 'curl';
  responseStatus: string = '';
  apiResponse: string = '';
  editor: any;
  editorOptions = {
    theme: 'vs-light',
    language: 'plaintext',
    minimap: { enabled: false },
    automaticLayout: true,
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: true,
    autoIndent: 'full'
  };

  // Default order ID
  defaultOrderId = 3466838;

  // Default request payload
  defaultRequestPayload = {
    search: null,
    filterBy: null,
    pagination: {
      sortBy: "id",
      descending: false,
      page: 1,
      rowsPerPage: 100000000,
      rowsNumber: 0
    }
  };

  // Default code samples
  defaultCodeSamples = {
    curl: `curl -X POST \\
'https://api.99gift.in/user/card-list/${this.defaultOrderId}' \\
-H 'Content-Type: application/json' \\
-H 'Authorization: Bearer YOUR_API_TOKEN' \\
-d '${JSON.stringify(this.defaultRequestPayload, null, 2)}'`,
    javascript: `// Using Fetch API
const voucherDetailsData = ${JSON.stringify(this.defaultRequestPayload, null, 2)};

fetch('https://api.99gift.in/user/card-list/${this.defaultOrderId}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_TOKEN'
  },
  body: JSON.stringify(voucherDetailsData)
})
.then(response => response.json())
.then(data => {
  console.log('Voucher details:', data);
  // Handle the voucher details data
})
.catch(error => console.error('Error:', error));`,
    python: `import requests

voucher_details_data = ${JSON.stringify(this.defaultRequestPayload, null, 2)}

response = requests.post(
  "https://api.99gift.in/user/card-list/${this.defaultOrderId}",
  json=voucher_details_data,
  headers={
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_TOKEN"
  }
)

if response.status_code == 200:
  print("Voucher details:", response.json())
else:
  print("Error:", response.text)`,
    php: `<?php
$voucherDetailsData = ${JSON.stringify(this.defaultRequestPayload, null, 2)};

$options = [
  'http' => [
    'header' => "Content-Type: application/json\\r\\nAuthorization: Bearer YOUR_API_TOKEN\\r\\n",
    'method' => 'POST',
    'content' => json_encode($voucherDetailsData)
  ]
];

$context = stream_context_create($options);
$response = file_get_contents(
  'https://api.99gift.in/user/card-list/${this.defaultOrderId}', 
  false, 
  $context
);

if ($response !== false) {
  $responseData = json_decode($response, true);
  echo "Voucher details: ";
  print_r($responseData);
} else {
  echo "Request failed";
}
?>`
  };

  codeSamples = {...this.defaultCodeSamples};

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngAfterViewInit() {
    this.initEditor();
  }

  initEditor() {
    this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
      value: this.codeSamples.curl,
      language: 'plaintext',
      theme: 'vs-light',
      automaticLayout: true,
      minimap: { enabled: false }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (this.editor) {
      this.editor.setValue(this.codeSamples[tab as keyof typeof this.codeSamples]);
      let language = 'plaintext';
      switch(tab) {
        case 'javascript': language = 'javascript'; break;
        case 'python': language = 'python'; break;
        case 'php': language = 'php'; break;
      }
      monaco.editor.setModelLanguage(this.editor.getModel(), language);
    }
  }

  executeCode(): void {
    this.responseStatus = '';
    this.apiResponse = 'Executing...';

    // Extract the order ID and JSON payload from the editor content
    const editorContent = this.editor.getValue();
    let orderId: any;
    let payload: any;

    try {
      if (this.activeTab === 'curl') {
        // Parse curl command to extract order ID and JSON payload
        const idMatch = editorContent.match(/card-list\/(\d+)/);
        if (idMatch && idMatch[1]) {
          orderId = parseInt(idMatch[1]);
        } else {
          throw new Error('Could not extract order ID from curl command');
        }
        const jsonMatch = editorContent.match(/-d\s+'([^']+)'/);
        if (jsonMatch && jsonMatch[1]) {
          payload = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Could not extract JSON payload from curl command');
        }
      } else if (this.activeTab === 'javascript') {
        // Parse JavaScript code to extract order ID and payload
        const idMatch = editorContent.match(/card-list\/(\d+)/);
        if (idMatch && idMatch[1]) {
          orderId = parseInt(idMatch[1]);
        } else {
          throw new Error('Could not extract order ID from JavaScript code');
        }
        const jsonMatch = editorContent.match(/const voucherDetailsData = ({[^}]+})/);
        if (jsonMatch && jsonMatch[1]) {
          payload = eval(`(${jsonMatch[1]})`);
        } else {
          throw new Error('Could not extract payload from JavaScript code');
        }
      } else if (this.activeTab === 'python') {
        // Parse Python code to extract order ID and payload
        const idMatch = editorContent.match(/card-list\/(\d+)/);
        if (idMatch && idMatch[1]) {
          orderId = parseInt(idMatch[1]);
        } else {
          throw new Error('Could not extract order ID from Python code');
        }
        const jsonMatch = editorContent.match(/voucher_details_data = ({[^}]+})/);
        if (jsonMatch && jsonMatch[1]) {
          // Convert Python dict syntax to JSON
          const pythonDict = jsonMatch[1]
            .replace(/'/g, '"')
            .replace(/True/g, 'true')
            .replace(/False/g, 'false');
          payload = JSON.parse(pythonDict);
        } else {
          throw new Error('Could not extract payload from Python code');
        }
      } else if (this.activeTab === 'php') {
        // Parse PHP code to extract order ID and payload
        const idMatch = editorContent.match(/card-list\/(\d+)/);
        if (idMatch && idMatch[1]) {
          orderId = parseInt(idMatch[1]);
        } else {
          throw new Error('Could not extract order ID from PHP code');
        }
        const jsonMatch = editorContent.match(/\$voucherDetailsData = (\[[^\]]+\])/);
        if (jsonMatch && jsonMatch[1]) {
          // Convert PHP array syntax to JSON
          const phpArray = jsonMatch[1]
            .replace(/'/g, '"')
            .replace(/=>/g, ':')
            .replace(/\$[a-zA-Z_]+/g, '"$&"');
          payload = JSON.parse(phpArray);
        } else {
          throw new Error('Could not extract payload from PHP code');
        }
      }

      // Check for authorization header
      const hasAuthHeader = editorContent.includes("Authorization: Bearer") || 
                          editorContent.includes("'Authorization'") || 
                          editorContent.includes('"Authorization"');

      if (!hasAuthHeader) {
        this.responseStatus = 'error';
        this.apiResponse = JSON.stringify({
          status: false,
          message: "Authorization token is required",
          data: null,
          pagination: null
        }, null, 2);
        return;
      }

      // Generate mock response based on order ID
      this.responseStatus = 'success';
      this.apiResponse = JSON.stringify({
        status: true,
        message: "Success",
        duration: 0.004853010177612305,
        data: {
          order: {
            id: orderId || this.defaultOrderId,
            invoice_id: "ZP1111799",
            user_id: 188699,
            api_id: 7,
            product_id: 694,
            subproduct_id: 1737,
            ProductGuid: "GOOL10",
            PRODUCTCODE: "GOOL10",
            amount: 10,
            qty: 1,
            discounted_value: 0.3,
            corp_discount: 3,
            gross_amount: 10,
            net_amount: 9.7,
            opening_balance: 190.3,
            closing_balance: 180.6,
            paymentType: "wallet",
            customerName: "Amarnath kumar",
            mobileNo: "",
            emailID: "XXXXX@gmail.com",
            txnid: null,
            remark: null,
            description: null,
            status_id: 1,
            created_at: "2025-06-27T05:39:26.000000Z",
            updated_at: "2025-06-27T05:39:26.000000Z",
            product: {
              id: 694,
              title: "Google Play E-Gift Voucher",
              image: "https://99paisa.s3.ap-south-1.amazonaws.com/fund--request/cQXcnF2zu4BXaWaD7UWXG3y5bZ7Ld5RmIgL13k2p.jpg"
            }
          },
          data: [
            {
              id: 2639649,
              user_id: "XXXX",
              api_id: 7,
              report_id: "XXXX",
              ProductName: "Google Play E-Gift Voucher",
              VoucherName: "Google Play E-Gift Voucher - RS 10",
              VoucherGuid: "",
              view_code: null,
              VoucherGCcode: "",
              Value: "10",
              VoucherNo: "5302992854360359",
              Voucherpin: "DN3UWMFS10F7NVBJ",
              EndDate: "2025-01-01",
              status: 1,
              date: "2025-06-27T05:39:26.000000Z",
            }
          ]
        },
        pagination: {
          page: payload?.pagination?.page || 1,
          rowsPerPage: payload?.pagination?.rowsPerPage || 100000000,
          sortBy: payload?.pagination?.sortBy || "id",
          descending: payload?.pagination?.descending || false,
          total: 1
        }
      }, null, 2);

    } catch (error) {
      this.responseStatus = 'error';
      this.apiResponse = JSON.stringify({
        status: false,
        message: "Failed to fetch voucher details",
        data: null,
        pagination: null
      }, null, 2);
    }
  }

  resetCode(): void {
    this.codeSamples = {...this.defaultCodeSamples};
    if (this.editor) {
      this.editor.setValue(this.codeSamples[this.activeTab as keyof typeof this.codeSamples]);
    }
    this.apiResponse = '';
    this.responseStatus = '';
  }

  copyResponse(): void {
    if (this.apiResponse) {
      navigator.clipboard.writeText(this.apiResponse)
        .then(() => {
          const copyBtn = document.querySelector('.copy-btn');
          if (copyBtn) {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
              if (copyBtn) copyBtn.textContent = originalText;
            }, 2000);
          }
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  }

  formatJson(json: string): SafeHtml {
    try {
      const parsed = JSON.parse(json);
      const formatted = JSON.stringify(parsed, null, 2)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, match => {
          let cls = 'token number';
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = 'token key';
            } else {
              cls = 'token string';
            }
          } else if (/true|false/.test(match)) {
            cls = 'token boolean';
          } else if (/null/.test(match)) {
            cls = 'token null';
          }
          return `<span class="${cls}">${match}</span>`;
        });
      return this.sanitizer.bypassSecurityTrustHtml(formatted);
    } catch (e) {
      return this.sanitizer.bypassSecurityTrustHtml(json);
    }
  }
}
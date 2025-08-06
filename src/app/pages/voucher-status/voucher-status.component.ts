import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { SidebarComponent } from "../../layouts/sidebar/sidebar.component";
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
declare const monaco: any;
@Component({
  selector: 'app-voucher-status',
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './voucher-status.component.html',
  styleUrl: './voucher-status.component.scss'
})
export class VoucherStatusComponent {
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

  // Default status ID
  defaultStatusId = 0;

  // Default request payload
  defaultRequestPayload = {
    search: null,
    filterBy: null,
    date: {
      from: "2025/05/30",
      to: "2025/06/30"
    },
    pagination: {
      sortBy: "id",
      descending: true,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0
    },
    status: 0
  };

  // Default code samples
  defaultCodeSamples = {
    curl: `curl -X POST \\
'https://api.99gift.in/user/reports/${this.defaultStatusId}' \\
-H 'Content-Type: application/json' \\
-H 'Authorization: Bearer YOUR_API_TOKEN' \\
-d '${JSON.stringify(this.defaultRequestPayload, null, 2)}'`,
    javascript: `// Using Fetch API
const voucherStatusData = ${JSON.stringify(this.defaultRequestPayload, null, 2)};

fetch('https://api.99gift.in/user/reports/${this.defaultStatusId}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_TOKEN'
  },
  body: JSON.stringify(voucherStatusData)
})
.then(response => response.json())
.then(data => {
  console.log('Voucher status:', data);
  // Handle the voucher status data
})
.catch(error => console.error('Error:', error));`,
    python: `import requests

voucher_status_data = ${JSON.stringify(this.defaultRequestPayload, null, 2)}

response = requests.post(
  "https://api.99gift.in/user/reports/${this.defaultStatusId}",
  json=voucher_status_data,
  headers={
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_TOKEN"
  }
)

if response.status_code == 200:
  print("Voucher status:", response.json())
else:
  print("Error:", response.text)`,
    php: `<?php
$voucherStatusData = ${JSON.stringify(this.defaultRequestPayload, null, 2)};

$options = [
  'http' => [
    'header' => "Content-Type: application/json\\r\\nAuthorization: Bearer YOUR_API_TOKEN\\r\\n",
    'method' => 'POST',
    'content' => json_encode($voucherStatusData)
  ]
];

$context = stream_context_create($options);
$response = file_get_contents(
  'https://api.99gift.in/user/reports/${this.defaultStatusId}', 
  false, 
  $context
);

if ($response !== false) {
  $responseData = json_decode($response, true);
  echo "Voucher status: ";
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

    // Extract the status ID and JSON payload from the editor content
    const editorContent = this.editor.getValue();
    let statusId: any;
    let payload: any;

    try {
      if (this.activeTab === 'curl') {
        // Parse curl command to extract status ID and JSON payload
        const idMatch = editorContent.match(/user\/reports\/(\d+)/);
        if (idMatch && idMatch[1]) {
          statusId = parseInt(idMatch[1]);
        } else {
          throw new Error('Could not extract status ID from curl command');
        }
        const jsonMatch = editorContent.match(/-d\s+'([^']+)'/);
        if (jsonMatch && jsonMatch[1]) {
          payload = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Could not extract JSON payload from curl command');
        }
      } else if (this.activeTab === 'javascript') {
        // Parse JavaScript code to extract status ID and payload
        const idMatch = editorContent.match(/user\/reports\/(\d+)/);
        if (idMatch && idMatch[1]) {
          statusId = parseInt(idMatch[1]);
        } else {
          throw new Error('Could not extract status ID from JavaScript code');
        }
        const jsonMatch = editorContent.match(/const voucherStatusData = ({[^}]+})/);
        if (jsonMatch && jsonMatch[1]) {
          payload = eval(`(${jsonMatch[1]})`);
        } else {
          throw new Error('Could not extract payload from JavaScript code');
        }
      } else if (this.activeTab === 'python') {
        // Parse Python code to extract status ID and payload
        const idMatch = editorContent.match(/user\/reports\/(\d+)/);
        if (idMatch && idMatch[1]) {
          statusId = parseInt(idMatch[1]);
        } else {
          throw new Error('Could not extract status ID from Python code');
        }
        const jsonMatch = editorContent.match(/voucher_status_data = ({[^}]+})/);
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
        // Parse PHP code to extract status ID and payload
        const idMatch = editorContent.match(/user\/reports\/(\d+)/);
        if (idMatch && idMatch[1]) {
          statusId = parseInt(idMatch[1]);
        } else {
          throw new Error('Could not extract status ID from PHP code');
        }
        const jsonMatch = editorContent.match(/\$voucherStatusData = (\[[^\]]+\])/);
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

      // Generate mock response based on status ID
      this.responseStatus = 'success';
      this.apiResponse = JSON.stringify({
        status: true,
        message: "Success",
        data: [
          {
            id: 3466838,
            invoice_id: "ZP1111799",
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
            emailID: "amarnath8247@gmail.com",
            remark: null,
            description: null,
            created_at: "2025-06-27T05:39:26.000000Z",
            product: {
              id: 694,
              title: "Google Play E-Gift Voucher",
              image: "https://99paisa.s3.ap-south-1.amazonaws.com/fund--request/cXG3yL13k2p.jpg"
            },
            status: {
              id: statusId || 1,
              status: this.getStatusText(statusId || 1)
            }
          }
        ],
        pagination: {
          page: payload?.pagination?.page || 1,
          rowsPerPage: payload?.pagination?.rowsPerPage || 10,
          sortBy: payload?.pagination?.sortBy || "id",
          descending: payload?.pagination?.descending || true,
          total: 1
        }
      }, null, 2);

    } catch (error) {
      this.responseStatus = 'error';
      this.apiResponse = JSON.stringify({
        status: false,
        message: "Failed to fetch voucher status",
        data: null,
        pagination: null
      }, null, 2);
    }
  }

  private getStatusText(statusId: number): string {
    switch(statusId) {
      case 0: return "All";
      case 1: return "Success";
      case 2: return "Failed";
      case 6: return "Processing";
      case 7: return "Pending";
      case 8: return "Cancelled";
      case 10: return "Refunded";
      default: return "Unknown";
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

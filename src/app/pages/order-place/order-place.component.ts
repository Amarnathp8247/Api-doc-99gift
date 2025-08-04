import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { SidebarComponent } from "../../layouts/sidebar/sidebar.component";
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as monaco from 'monaco-editor';
import { MonacoEditorModule } from 'ngx-monaco-editor';

@Component({
  selector: 'app-order-place',
  imports: [CommonModule, FormsModule, SidebarComponent, MonacoEditorModule],
  templateUrl: './order-place.component.html',
  styleUrl: './order-place.component.scss'
})
export class OrderPlaceComponent {
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

  // Default request payload
  defaultRequestPayload = {
    productId: 694,
    walletPayment: true,
    emailID: "test@99gift.in",
    mobileNo: "82XXXXXX94",
    customerName: "Test",
    denominations: [
      {
        amount: 10,
        corp_discount: 3,
        quantity: 1,
        product_id: "694",
        subproduct_id: 1737,
        PRODUCTCODE: "GOOL10",
        ProductGuid: "GOOL10",
        skuID: "OFFGOOGLENW"
      }
    ],
    skuID: "OFFGOOGLENW",
    corp_order: true,
    corp_discount: 3,
    authcode: "98XX98"
  };

  // Default code samples
  defaultCodeSamples = {
    curl: `curl -X PUT \\
'https://api.99gift.in/gift/order-create-corporate' \\
-H 'Content-Type: application/json' \\
-H 'Authorization: Bearer YOUR_API_TOKEN' \\
-d '${JSON.stringify({data: "ENCRYPTED_PAYLOAD"}, null, 2)}'`,
    javascript: `// Using Fetch API
const orderData = ${JSON.stringify(this.defaultRequestPayload, null, 2)};
// Note: In a real implementation, you would encrypt the payload here

fetch('https://api.99gift.in/gift/order-create-corporate', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_TOKEN'
  },
  body: JSON.stringify({data: "ENCRYPTED_PAYLOAD"}) // Replace with encrypted payload
})
.then(response => response.json())
.then(data => {
  console.log('Order response:', data);
  // Handle the order response
})
.catch(error => console.error('Error:', error));`,
    python: `import requests

order_data = ${JSON.stringify(this.defaultRequestPayload, null, 2)}
# Note: In a real implementation, you would encrypt the payload here

response = requests.put(
  "https://api.99gift.in/gift/order-create-corporate",
  json={"data": "ENCRYPTED_PAYLOAD"},  # Replace with encrypted payload
  headers={
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_TOKEN"
  }
)

if response.status_code == 200:
  print("Order response:", response.json())
else:
  print("Error:", response.text)`,
    php: `<?php
$orderData = ${JSON.stringify(this.defaultRequestPayload, null, 2)};
// Note: In a real implementation, you would encrypt the payload here

$options = [
  'http' => [
    'header' => "Content-Type: application/json\\r\\nAuthorization: Bearer YOUR_API_TOKEN\\r\\n",
    'method' => 'PUT',
    'content' => json_encode(["data" => "ENCRYPTED_PAYLOAD"]) // Replace with encrypted payload
  ]
];

$context = stream_context_create($options);
$response = file_get_contents(
  'https://api.99gift.in/gift/order-create-corporate', 
  false, 
  $context
);

if ($response !== false) {
  $responseData = json_decode($response, true);
  echo "Order response: ";
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

    // In a real implementation, you would encrypt the payload here
    // For demo purposes, we'll just use the mock response
    try {
      // Check if authorization header is present
      const editorContent = this.editor.getValue();
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

      // Generate mock success response
      this.responseStatus = 'success';
      this.apiResponse = JSON.stringify({
        status: true,
        message: "Order Processed Successful! Please Check Report!",
        data: {
          orderId: "ZPXXXX120",
          gateway: false,
          totalAmount: 9.7,
          walletPaid: 9.7,
          product_info: null
        },
        pagination: null
      }, null, 2);

    } catch (error) {
      this.responseStatus = 'error';
      this.apiResponse = JSON.stringify({
        status: false,
        message: "Failed to process order",
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
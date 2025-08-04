import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { SidebarComponent } from "../../layouts/sidebar/sidebar.component";
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as monaco from 'monaco-editor';
import { MonacoEditorModule } from 'ngx-monaco-editor';


@Component({
  selector: 'app-product-details',
  imports: [CommonModule, FormsModule, SidebarComponent, MonacoEditorModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent {
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

  // Default product ID
  defaultProductId = 694;

  // Default code samples
  defaultCodeSamples = {
    curl: `curl -X GET \\
'https://api.99gift.in/product/infos/${this.defaultProductId}' \\
-H 'Content-Type: application/json'`,
    javascript: `// Using Fetch API
fetch('https://api.99gift.in/product/infos/${this.defaultProductId}', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log('Product details:', data);
  // Handle the product details
})
.catch(error => console.error('Error:', error));`,
    python: `import requests

response = requests.get(
  "https://api.99gift.in/product/infos/${this.defaultProductId}",
  headers={"Content-Type": "application/json"}
)

if response.status_code == 200:
  print("Product details:", response.json())
else:
  print("Error:", response.text)`,
    php: `<?php
$options = [
  'http' => [
    'header' => "Content-Type: application/json\\r\\n",
    'method' => 'GET'
  ]
];

$context = stream_context_create($options);
$response = file_get_contents(
  'https://api.99gift.in/product/infos/${this.defaultProductId}', 
  false, 
  $context
);

if ($response !== false) {
  $responseData = json_decode($response, true);
  echo "Product details: ";
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

    // Extract the product ID from the editor content
    const editorContent = this.editor.getValue();
    let productId: any;

    try {
      if (this.activeTab === 'curl') {
        // Parse curl command to extract product ID
        const idMatch = editorContent.match(/product\/infos\/(\d+)/);
        if (idMatch && idMatch[1]) {
          productId = parseInt(idMatch[1]);
        } else {
          throw new Error('Could not extract product ID from curl command');
        }
      } else if (this.activeTab === 'javascript') {
        // Parse JavaScript code to extract product ID
        const idMatch = editorContent.match(/product\/infos\/(\d+)/);
        if (idMatch && idMatch[1]) {
          productId = parseInt(idMatch[1]);
        } else {
          throw new Error('Could not extract product ID from JavaScript code');
        }
      } else if (this.activeTab === 'python') {
        // Parse Python code to extract product ID
        const idMatch = editorContent.match(/product\/infos\/(\d+)/);
        if (idMatch && idMatch[1]) {
          productId = parseInt(idMatch[1]);
        } else {
          throw new Error('Could not extract product ID from Python code');
        }
      } else if (this.activeTab === 'php') {
        // Parse PHP code to extract product ID
        const idMatch = editorContent.match(/product\/infos\/(\d+)/);
        if (idMatch && idMatch[1]) {
          productId = parseInt(idMatch[1]);
        } else {
          throw new Error('Could not extract product ID from PHP code');
        }
      }

      // Generate mock response based on the product ID
      const productDetails = this.getMockProductDetails(productId);

      if (productDetails) {
        this.responseStatus = 'success';
        this.apiResponse = JSON.stringify({
          status: true,
          message: "Voucher Details",
          data: productDetails,
          pagination: null
        }, null, 2);
      } else {
        this.responseStatus = 'error';
        this.apiResponse = JSON.stringify({
          status: false,
          message: "Product not found",
          data: null,
          pagination: null
        }, null, 2);
      }

    } catch (error) {
      this.responseStatus = 'error';
      this.apiResponse = JSON.stringify({
        status: false,
        message: "Invalid request format",
        data: null,
        pagination: null
      }, null, 2);
    }
  }

  private getMockProductDetails(productId: number): any {
    // Mock data for different products
    const products = {
      694: {
        id: 694,
        routing_api_id: null,
        title: "Google Play E-Gift Voucher",
        image: "https://99paisa.s3.ap-south-1.amazonaws.com/fund--request/cQXcnF2zu4BXaWaD7UWXG3y5bZ7Ld5RmIgL13k2p.jpg",
        description: "A lot more Play. All on your Android.\r\nPower up in over ",
        terms: "1.Anti-fraud warning\n2.Any other request for the code may be a scam.\n3.Terms and Conditions\n4.Users must be India residents aged 18+",
        moreInfo: null,
        redeem: "To redeem, enter code in the Play Store app or play.google.com",
        min_price: 10,
        max_price: 50,
        discount_type: "percentage",
        corp_discount: 3,
        denomination: [
          {
            subproduct_id: 1737,
            product_id: "694",
            amount: 10,
            PRODUCTCODE: "GOOL10",
            ProductGuid: "GOOL10",
            skuID: null,
            stock_left: 169
          }
        ],
        brand: {
          id: 187,
          title: "Google Play Card",
          image: "https://www.verdict.co.uk/wp-content/uploads/2018/11/shutterstock_712915198-e1542045457155.jpg"
        },
        category: {
          id: 6,
          title: "Entertainment",
          image: "https://99paisa.s3.ap-south-1.amazonaws.com/fund--request/5UO8u0hPnTQWpnlKW3nieM0dutrRWA5YJLk8Bj8s.gif"
        }
      },
      695: {
        id: 695,
        routing_api_id: null,
        title: "Amazon Pay E-Gift Voucher",
        image: "https://99paisa.s3.amazonaws.com/fund--request/amazon_voucher.jpg",
        description: "Amazon Pay gift cards can be used to purchase crores of products on Amazon.in",
        terms: "1.Redeemable only on Amazon.in\n2.Valid for 10 years from date of issue\n3.No cash withdrawal",
        moreInfo: null,
        redeem: "Redeemable on Amazon.in website or mobile app",
        min_price: 100,
        max_price: 1000,
        discount_type: "percentage",
        corp_discount: 5,
        denomination: [], // Empty array means out of stock
        brand: {
          id: 188,
          title: "Amazon Pay",
          image: "https://99paisa.s3.amazonaws.com/fund--request/amazon_voucher.jpg"
        },
        category: {
          id: 6,
          title: "Entertainment",
          image: "https://99paisa.s3.ap-south-1.amazonaws.com/fund--request/5UO8u0hPnTQWpnlKW3nieM0dutrRWA5YJLk8Bj8s.gif"
        }
      }
    };

    return products[productId as keyof typeof products] || null;
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
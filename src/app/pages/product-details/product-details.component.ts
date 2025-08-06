import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from "../../layouts/sidebar/sidebar.component";
declare const monaco: any;
@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editorContainer', { static: false }) editorContainer!: ElementRef<HTMLElement>;

  activeTab: string = 'curl';
  responseStatus: string = '';
  apiResponse: string = '';
  editor:any;
  editorOptions = {
    theme: 'vs-light',
    language: 'plaintext',
    minimap: { enabled: false },
    automaticLayout: true,
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: true,
    autoIndent: 'full',
    formatOnPaste: true,
    formatOnType: true,
    suggestOnTriggerCharacters: true,
    wordBasedSuggestions: 'currentDocument',
    quickSuggestions: true,
    folding: true,
    renderWhitespace: 'selection',
    renderControlCharacters: false,
    scrollbar: {
      alwaysConsumeMouseWheel: false
    },
    hover: {
      enabled: true,
      delay: 300,
      sticky: true
    }
  };

  defaultProductId = 694;
  productIdInput = this.defaultProductId;

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
    this.initializeMonacoEditor();
  }

  ngOnDestroy() {
    this.disposeEditor();
  }

  private initializeMonacoEditor() {
    if (this.editorContainer) {
      this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
        value: this.codeSamples[this.activeTab as keyof typeof this.codeSamples],
        ...this.editorOptions
      });

      this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        this.formatDocument();
      });

      this.setupLanguageFeatures();
    }
  }

  private disposeEditor() {
    if (this.editor) {
      this.editor.dispose();
      this.editor = null;
    }
  }

  private setupLanguageFeatures() {
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model: any, position: any) => {
        const suggestions = [];
        
        suggestions.push({
          label: 'product/infos',
          kind: monaco.languages.CompletionItemKind.Function,
          documentation: 'Product details endpoint',
          insertText: "'https://api.99gift.in/product/infos/'",
          range: new monaco.Range(
            position.lineNumber, 
            position.column, 
            position.lineNumber, 
            position.column
          )
        });

        return { suggestions };
      }
    });
  }

  formatDocument() {
    if (this.editor) {
      this.editor.getAction('editor.action.formatDocument')?.run();
    }
  }

  updateCodeSamples() {
    this.codeSamples = {
      curl: `curl -X GET \\
'https://api.99gift.in/product/infos/${this.productIdInput}' \\
-H 'Content-Type: application/json'`,
      javascript: `// Using Fetch API
fetch('https://api.99gift.in/product/infos/${this.productIdInput}', {
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
  "https://api.99gift.in/product/infos/${this.productIdInput}",
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
  'https://api.99gift.in/product/infos/${this.productIdInput}', 
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

    if (this.editor) {
      this.editor.setValue(this.codeSamples[this.activeTab as keyof typeof this.codeSamples]);
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    if (this.editor) {
      this.editor.setValue(this.codeSamples[tab as keyof typeof this.codeSamples]);
      
      let language = 'plaintext';
      switch (tab) {
        case 'javascript': language = 'javascript'; break;
        case 'python': language = 'python'; break;
        case 'php': language = 'php'; break;
        case 'curl': language = 'shell'; break;
      }
      
      const model = this.editor.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
    }
  }

  executeCode() {
    this.responseStatus = '';
    this.apiResponse = 'Executing...';

    try {
      const editorContent = this.editor?.getValue() || '';
      let productId: number;

      // Extract product ID from the editor content
      const idMatch = editorContent.match(/product\/infos\/(\d+)/);
      if (idMatch && idMatch[1]) {
        productId = parseInt(idMatch[1]);
      } else {
        throw new Error('Could not extract product ID from the request');
      }

      // Generate mock response based on the product ID
      setTimeout(() => {
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
      }, 800);

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
    const products: Record<number, any> = {
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

    return products[productId] || null;
  }

  resetCode() {
    this.productIdInput = this.defaultProductId;
    this.updateCodeSamples();
    this.apiResponse = '';
    this.responseStatus = '';
  }

  async copyResponse() {
    try {
      await navigator.clipboard.writeText(this.apiResponse);
      const copyBtn = document.querySelector('.copy-btn');
      if (copyBtn) {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          if (copyBtn) copyBtn.textContent = originalText;
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
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
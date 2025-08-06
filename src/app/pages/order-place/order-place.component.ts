import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from "../../layouts/sidebar/sidebar.component";

declare const monaco: any;

@Component({
  selector: 'app-order-place',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './order-place.component.html',
  styleUrls: ['./order-place.component.scss']
})
export class OrderPlaceComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editorContainer', { static: false }) editorContainer!: ElementRef<HTMLElement>;

  activeTab: string = 'curl';
  responseStatus: string = '';
  apiResponse: string = '';
  editor: any;
  isMonacoLoaded = false;
  
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
  json={"data": "ENCRYPTED_PAYLOAD"},  // Replace with encrypted payload
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
    this.loadMonacoEditor();
  }

  private loadMonacoEditor() {
    if (typeof monaco !== 'undefined') {
      this.initializeMonacoEditor();
    } else {
      const onGotAmdLoader = () => {
        (window as any).require.config({
          paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }
        });
        (window as any).require(['vs/editor/editor.main'], () => {
          this.isMonacoLoaded = true;
          this.initializeMonacoEditor();
        });
      };

      if (!document.querySelector('script[src*="monaco-editor"]')) {
        const loaderScript = document.createElement('script');
        loaderScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js';
        loaderScript.addEventListener('load', onGotAmdLoader);
        document.body.appendChild(loaderScript);
      } else {
        onGotAmdLoader();
      }
    }
  }

  private initializeMonacoEditor() {
    if (this.editorContainer && (this.isMonacoLoaded || typeof monaco !== 'undefined')) {
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

  ngOnDestroy() {
    this.disposeEditor();
  }

  private disposeEditor() {
    if (this.editor) {
      this.editor.dispose();
      this.editor = null;
    }
  }

  private setupLanguageFeatures() {
    if (monaco?.languages) {
      monaco.languages.registerCompletionItemProvider('javascript', {
        provideCompletionItems: (model: any, position: any) => {
          return {
            suggestions: [{
              label: 'order-create-corporate',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Corporate order creation endpoint',
              insertText: "'https://api.99gift.in/gift/order-create-corporate'",
              range: new monaco.Range(
                position.lineNumber, 
                position.column, 
                position.lineNumber, 
                position.column
              )
            }]
          };
        }
      });
    }
  }

  formatDocument() {
    if (this.editor) {
      this.editor.getAction('editor.action.formatDocument')?.run();
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    const value = this.codeSamples[tab as keyof typeof this.codeSamples];
    
    if (this.editor) {
      this.editor.setValue(value);
      
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

  async executeCode() {
    this.responseStatus = '';
    this.apiResponse = 'Executing...';
    const editorContent = this.editor?.getValue() || '';
    let payload: any;

    try {
      if (this.activeTab === 'curl') {
        const match = editorContent.match(/-d\s+'([^']+)'/);
        if (!match) throw new Error('Invalid curl payload');
        payload = JSON.parse(match[1]);
      } else if (this.activeTab === 'javascript') {
        const match = editorContent.match(/const orderData = ({[\s\S]*?})/);
        if (!match) throw new Error('Invalid JS payload');
        payload = eval(`(${match[1]})`);
      } else if (this.activeTab === 'python') {
        const match = editorContent.match(/order_data = ({[\s\S]*?})/);
        if (!match) throw new Error('Invalid Python payload');
        payload = JSON.parse(match[1].replace(/'/g, '"'));
      } else if (this.activeTab === 'php') {
        const match = editorContent.match(/\$orderData = (\[[\s\S]*?\])/);
        if (!match) throw new Error('Invalid PHP payload');
        payload = JSON.parse(match[1].replace(/'/g, '"').replace(/=>/g, ':'));
      }

      const hasAuth = editorContent.includes("Authorization: Bearer") || 
                     editorContent.includes("'Authorization'") || 
                     editorContent.includes('"Authorization"');

      if (!hasAuth) throw new Error('Authorization token is required');

      await new Promise(resolve => setTimeout(resolve, 800));
      
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

    } catch (err) {
      this.responseStatus = 'error';
      this.apiResponse = JSON.stringify({
        status: false,
        message: (err instanceof Error ? err.message : 'Unknown error'),
        data: null,
        pagination: null
      }, null, 2);
    }
  }

  resetCode() {
    this.codeSamples = {...this.defaultCodeSamples};
    if (this.editor) {
      this.editor.setValue(this.codeSamples[this.activeTab as keyof typeof this.codeSamples]);
    }
    this.apiResponse = '';
    this.responseStatus = '';
  }

  async copyResponse() {
    try {
      await navigator.clipboard.writeText(this.apiResponse);
      const btn = document.querySelector('.copy-btn');
      if (btn) {
        const original = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = original || 'Copy', 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
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
            cls = /:$/.test(match) ? 'token key' : 'token string';
          } else if (/true|false/.test(match)) {
            cls = 'token boolean';
          } else if (/null/.test(match)) {
            cls = 'token null';
          }
          return `<span class="${cls}">${match}</span>`;
        });
      return this.sanitizer.bypassSecurityTrustHtml(formatted);
    } catch {
      return this.sanitizer.bypassSecurityTrustHtml(json);
    }
  }
}
import { Component, AfterViewInit, NgZone, OnDestroy } from '@angular/core';
import { SidebarComponent } from "../../layouts/sidebar/sidebar.component";
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import CryptoJS from 'crypto-js';

// Declare Monaco types for CDN usage
declare const monaco: any;

interface MonacoEditor {
  editor: {
    create: (element: HTMLElement, options: any) => any;
    IStandaloneCodeEditor: any;
  };
  languages: {
    registerCompletionItemProvider: (languageId: string, provider: any) => void;
  };
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, SidebarComponent, FormsModule],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements AfterViewInit, OnDestroy {
  // Tab management
  activeTab: string = 'encryption-js';
  activeEndpointTab: { [key: string]: string } = {};

  // Monaco Editor options
  editorOptions = {
    theme: 'vs-dark',
    language: 'javascript',
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'off',
    roundedSelection: true,
    scrollbar: {
      vertical: 'hidden',
      horizontal: 'hidden',
      handleMouseWheel: true
    }
  };

  // Code examples (same as your original)
  codeExamples = {
    encryption: {
      js: `// Using crypto-js library...`,
      python: `from Crypto.Cipher import AES...`,
      php: `<?php...`,
      java: `import javax.crypto.Cipher...`
    },
    login: {
      curl: `curl -X POST...`,
      js: `// Using Fetch API...`,
      python: `import requests...`,
      php: `<?php...`
    },
    profile: {
      curl: `curl -X GET...`,
      js: `// Using Fetch API...`,
      python: `import requests...`
    }
  };

  // Encryption demo
  encryptionResult: string = '';
  showEncryptionResult: boolean = false;
  encryptionInput: any = {
    productId: 694,
    walletPayment: true,
    emailID: "test@99gift.in",
    mobileNo: "9182XXXXX94",
    customerName: "Test",
    denominations: [{
      amount: 10,
      corp_discount: 3,
      quantity: 1,
      product_id: "694",
      subproduct_id: 1737,
      PRODUCTCODE: "GOOL10",
      ProductGuid: "GOOL10",
      skuID: "OFFGOOGLENW"
    }]
  };

  // API demo
  apiResponses: { [key: string]: any } = {};
  executingCode: boolean = false;
  demoCredentials = {
    mobile: '9182XXXXX94',
    password: 'test@123',
    authcode: '128636'
  };

  // Encryption settings
  encryptionConfig = {
    secretKey: '12345678901234567890123456789012',
    iv: '1234567890123456'
  };

  // Monaco Editor instances
  editors: { [key: string]: any } = {};

  // Sample data for the documentation
  endpoints = [
    { id: 'login', title: 'Login API', method: 'POST', path: '/user/login-Corporate/merchant' },
    { id: 'profile', title: 'Profile API', method: 'GET', path: '/user/validate-token' },
    { id: 'product-list', title: 'Product List API', method: 'GET', path: '/list' },
    { id: 'order-place', title: 'Order Place API', method: 'PUT', path: '/gift/order-create-corporate' }
  ];

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private zone: NgZone
  ) {
    // Initialize active tabs for each endpoint
    this.endpoints.forEach(endpoint => {
      this.activeEndpointTab[endpoint.id] = `${endpoint.id}-curl`;
    });
  }

  ngAfterViewInit() {
    this.loadMonacoEditor();
  }

  loadMonacoEditor() {
    if (typeof monaco !== 'undefined') {
      this.initializeEditors();
    } else {
      const onGotAmdLoader = () => {
        (window as any).require.config({
          paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }
        });
        (window as any).require(['vs/editor/editor.main'], () => {
          this.initializeEditors();
        });
      };

      // Load AMD loader if needed
      if (!(window as any).require) {
        const loaderScript = document.createElement('script');
        loaderScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js';
        loaderScript.addEventListener('load', onGotAmdLoader);
        document.body.appendChild(loaderScript);
      } else {
        onGotAmdLoader();
      }
    }
  }

  initializeEditors() {
    this.zone.runOutsideAngular(() => {
      // Initialize editors for encryption examples
      Object.keys(this.codeExamples.encryption).forEach(lang => {
        const elementId = `encryption-${lang}`;
        const container = document.getElementById(elementId);
        if (container) {
          this.editors[elementId] = monaco.editor.create(container, {
            value: this.codeExamples.encryption[lang as keyof typeof this.codeExamples.encryption],
            language: lang,
            theme: 'vs-dark',
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            lineNumbers: 'off',
            renderWhitespace: 'none',
            scrollbar: {
              vertical: 'hidden',
              horizontal: 'hidden'
            }
          });
        }
      });

      // Initialize editors for endpoint examples
      ['login', 'profile'].forEach(endpoint => {
        Object.keys(this.codeExamples[endpoint as keyof typeof this.codeExamples]).forEach(lang => {
          const elementId = `${endpoint}-${lang}`;
          const container = document.getElementById(elementId);
          if (container) {
            this.editors[elementId] = monaco.editor.create(container, {
              value: (this.codeExamples[endpoint as keyof typeof this.codeExamples] as Record<string, string>)[lang],
              language: lang === 'curl' ? 'shell' : lang,
              theme: 'vs-dark',
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 13,
              lineNumbers: 'off',
              renderWhitespace: 'none',
              scrollbar: {
                vertical: 'hidden',
                horizontal: 'hidden'
              }
            });
          }
        });
      });
    });
  }

  ngOnDestroy() {
    // Clean up Monaco editors
    Object.values(this.editors).forEach(editor => {
      if (editor && typeof editor.dispose === 'function') {
        editor.dispose();
      }
    });
  }

  // [Rest of your methods remain exactly the same...]
  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
    setTimeout(() => {
      Object.keys(this.editors).forEach(key => {
        if (key.startsWith(tabId.split('-')[0])) {
          this.editors[key]?.layout();
        }
      });
    }, 0);
  }

  setEndpointActiveTab(endpointId: string, tabId: string): void {
    this.activeEndpointTab[endpointId] = tabId;
    setTimeout(() => {
      Object.keys(this.editors).forEach(key => {
        if (key.startsWith(endpointId)) {
          this.editors[key]?.layout();
        }
      });
    }, 0);
  }

  isActiveTab(tabId: string): boolean {
    return this.activeTab === tabId;
  }

  isEndpointActiveTab(endpointId: string, tabId: string): boolean {
    return this.activeEndpointTab[endpointId] === tabId;
  }

  encryptData(data: any): string {
    const key = CryptoJS.enc.Utf8.parse(this.encryptionConfig.secretKey);
    const iv = CryptoJS.enc.Utf8.parse(this.encryptionConfig.iv);

    const text = typeof data === 'string' ? data : JSON.stringify(data);

    const encrypted = CryptoJS.AES.encrypt(text, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return encrypted.toString();
  }

  runEncryptionDemo(): void {
    try {
      const encrypted = this.encryptData(this.encryptionInput);
      this.encryptionResult = JSON.stringify({ data: encrypted }, null, 2);
      this.showEncryptionResult = true;
    } catch (error) {
      this.encryptionResult = `Encryption error: ${error}`;
      this.showEncryptionResult = true;
    }
  }

  tryApiRequest(endpointId: string): void {
    this.executingCode = true;
    this.apiResponses[endpointId] = 'Executing...';

    setTimeout(() => {
      switch (endpointId) {
        case 'login':
          this.mockLoginRequest();
          break;
        case 'profile':
          this.mockProfileRequest();
          break;
        case 'product-list':
          this.mockProductListRequest();
          break;
        case 'order-place':
          this.mockOrderPlaceRequest();
          break;
      }
      this.executingCode = false;
    }, 1500);
  }

  private mockLoginRequest(): void {
    if (this.demoCredentials.mobile === '9182XXXXX94' && 
        this.demoCredentials.password === 'test@123' && 
        this.demoCredentials.authcode === '128636') {
      this.apiResponses['login'] = {
        status: true,
        message: "Login Success!",
        data: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3NTEyODI4NzAsIm5iZiI6MTc1",
        user_detail: {
          id: 188699,
          email: "corptest@99gift.in",
          mobile: "9182XXXXX94",
          balance: 180.6,
          name: "Test"
        },
        pagination: null
      };
    } else {
      this.apiResponses['login'] = {
        status: false,
        message: "Invalid credentials or 2FA code",
        data: null
      };
    }
  }

  private mockProfileRequest(): void {
    this.apiResponses['profile'] = {
      status: true,
      message: "User details!",
      data: {
        id: 188699,
        name: "Amarnath",
        mobile: "9182XXXXX94",
        email: "corptest@99gift.in",
        balance: 180.6,
        corporate_name: null,
        pin_code: null
      }
    };
  }

  private mockProductListRequest(): void {
    this.apiResponses['product-list'] = {
      status: true,
      message: "Card's List New!",
      data: [
        {
          id: 694,
          sku: "OFFGOOGLENW",
          title: "Google Play E-Gift Voucher",
          image: "https://99paisa.s3.amazonaws.com/fund--request/cQXcnF2zu4BXaWaD7UWXG3y5bZ7Ld5RmIgL13k2p.jpg",
          website: 1,
          store: 0,
          min_price: 10,
          max_price: 50,
          discount_type: "percentage",
          points: 0,
          corp_discount: 3,
          category: {
            id: 6,
            title: "Entertainment",
            status: 1
          }
        }
      ],
      pagination: {
        page: 1,
        rowsPerPage: 100,
        sortBy: "display",
        descending: false,
        total: 0
      }
    };
  }

  private mockOrderPlaceRequest(): void {
    this.apiResponses['order-place'] = {
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
    };
  }

  copyCode(elementId: string): void {
    const editor = this.editors[elementId];
    if (editor) {
      const code = editor.getValue();
      navigator.clipboard.writeText(code).then(() => {
        const copyButton = document.querySelector(`[data-copy="${elementId}"]`);
        if (copyButton) {
          const originalText = copyButton.textContent;
          copyButton.textContent = 'Copied!';
          setTimeout(() => {
            if (copyButton) copyButton.textContent = originalText;
          }, 2000);
        }
      });
    }
  }

  copyResponse(endpointId: string): void {
    const response = this.apiResponses[endpointId];
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    }
  }

  formatJson(json: any): SafeHtml {
    if (typeof json === 'string') {
      try {
        json = JSON.parse(json);
      } catch (e) {
        return this.sanitizer.bypassSecurityTrustHtml(json);
      }
    }
    const formatted = JSON.stringify(json, null, 2)
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
  }
}
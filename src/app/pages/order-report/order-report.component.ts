import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from "../../layouts/sidebar/sidebar.component";
declare const monaco: any;
@Component({
  selector: 'app-order-report',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './order-report.component.html',
  styleUrls: ['./order-report.component.scss']
})
export class OrderReportComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editorContainer', { static: false }) editorContainer!: ElementRef<HTMLElement>;

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

  defaultCodeSamples = {
    curl: `curl -X POST \\
'https://api.99gift.in/user/reports/0' \\
-H 'Content-Type: application/json' \\
-H 'Authorization: Bearer YOUR_API_TOKEN' \\
-d '${JSON.stringify(this.defaultRequestPayload, null, 2)}'`,
    javascript: `// Using Fetch API
const reportData = ${JSON.stringify(this.defaultRequestPayload, null, 2)};

fetch('https://api.99gift.in/user/reports/0', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_TOKEN'
  },
  body: JSON.stringify(reportData)
})
.then(response => response.json())
.then(data => {
  console.log('Order reports:', data);
  // Handle the order reports data
})
.catch(error => console.error('Error:', error));`,
    python: `import requests

report_data = ${JSON.stringify(this.defaultRequestPayload, null, 2)}

response = requests.post(
  "https://api.99gift.in/user/reports/0",
  json=report_data,
  headers={
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_TOKEN"
  }
)

if response.status_code == 200:
  print("Order reports:", response.json())
else:
  print("Error:", response.text)`,
    php: `<?php
$reportData = ${JSON.stringify(this.defaultRequestPayload, null, 2)};

$options = [
  'http' => [
    'header' => "Content-Type: application/json\\r\\nAuthorization: Bearer YOUR_API_TOKEN\\r\\n",
    'method' => 'POST',
    'content' => json_encode($reportData)
  ]
];

$context = stream_context_create($options);
$response = file_get_contents(
  'https://api.99gift.in/user/reports/0', 
  false, 
  $context
);

if ($response !== false) {
  $responseData = json_decode($response, true);
  echo "Order reports: ";
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
    if (this.editorContainer && typeof monaco !== 'undefined') {
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
    if (monaco?.languages) {
      monaco.languages.registerCompletionItemProvider('javascript', {
        rovideCompletionItems: (model: any, position: any)  => {
          return {
            suggestions: [{
              label: 'user/reports/0',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Order reports endpoint',
              insertText: "'https://api.99gift.in/user/reports/0'",
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
        const match = editorContent.match(/const reportData = ({[\s\S]*?})/);
        if (!match) throw new Error('Invalid JS payload');
        payload = eval(`(${match[1]})`);
      } else if (this.activeTab === 'python') {
        const match = editorContent.match(/report_data = ({[\s\S]*?})/);
        if (!match) throw new Error('Invalid Python payload');
        payload = JSON.parse(match[1].replace(/'/g, '"'));
      } else if (this.activeTab === 'php') {
        const match = editorContent.match(/\$reportData = (\[[\s\S]*?\])/);
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
            customerName: "xxxx kumar",
            mobileNo: "",
            emailID: "xxxxxx@gmail.com",
            remark: null,
            description: null,
            created_at: "2025-06-27T05:39:26.000000Z",
            product: {
              id: 694,
              title: "Google Play E-Gift Voucher",
              image: "https://99paisa.s3.ap-south-1.amazonaws.com/fund--request/cQXcn.jpg"
            },
            status: {
              id: 1,
              status: "Success"
            }
          }
        ],
        pagination: {
          page: 1,
          rowsPerPage: 10,
          sortBy: "id",
          descending: true,
          total: 2
        }
      }, null, 2);

    } catch (err) {
      this.responseStatus = 'error';
      this.apiResponse = JSON.stringify({
        status: false,
        message: (err instanceof Error ? err.message : 'Failed to fetch order reports'),
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
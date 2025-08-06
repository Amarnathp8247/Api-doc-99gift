import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { SidebarComponent } from "../../layouts/sidebar/sidebar.component";
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
declare const monaco: any;

@Component({
  selector: 'app-wallet-statement',
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './wallet-statement.component.html',
  styleUrl: './wallet-statement.component.scss'
})
export class WalletStatementComponent {
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
'https://api.99gift.in/user/account-statement' \\
-H 'Content-Type: application/json' \\
-H 'Authorization: Bearer YOUR_API_TOKEN' \\
-d '${JSON.stringify(this.defaultRequestPayload, null, 2)}'`,
    javascript: `// Using Fetch API
const accountStatementData = ${JSON.stringify(this.defaultRequestPayload, null, 2)};

fetch('https://api.99gift.in/user/account-statement', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_TOKEN'
  },
  body: JSON.stringify(accountStatementData)
})
.then(response => response.json())
.then(data => {
  console.log('Account statement:', data);
  // Handle the account statement data
})
.catch(error => console.error('Error:', error));`,
    python: `import requests

account_statement_data = ${JSON.stringify(this.defaultRequestPayload, null, 2)}

response = requests.post(
  "https://api.99gift.in/user/account-statement",
  json=account_statement_data,
  headers={
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_TOKEN"
  }
)

if response.status_code == 200:
  print("Account statement:", response.json())
else:
  print("Error:", response.text)`,
    php: `<?php
$accountStatementData = ${JSON.stringify(this.defaultRequestPayload, null, 2)};

$options = [
  'http' => [
    'header' => "Content-Type: application/json\\r\\nAuthorization: Bearer YOUR_API_TOKEN\\r\\n",
    'method' => 'POST',
    'content' => json_encode($accountStatementData)
  ]
];

$context = stream_context_create($options);
$response = file_get_contents(
  'https://api.99gift.in/user/account-statement', 
  false, 
  $context
);

if ($response !== false) {
  $responseData = json_decode($response, true);
  echo "Account statement: ";
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

    // Extract the JSON payload from the editor content
    const editorContent = this.editor.getValue();
    let payload: any;

    try {
      if (this.activeTab === 'curl') {
        // Parse curl command to extract JSON payload
        const jsonMatch = editorContent.match(/-d\s+'([^']+)'/);
        if (jsonMatch && jsonMatch[1]) {
          payload = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Could not extract JSON payload from curl command');
        }
      } else if (this.activeTab === 'javascript') {
        // Parse JavaScript code to extract payload
        const jsonMatch = editorContent.match(/const accountStatementData = ({[^}]+})/);
        if (jsonMatch && jsonMatch[1]) {
          payload = eval(`(${jsonMatch[1]})`);
        } else {
          throw new Error('Could not extract payload from JavaScript code');
        }
      } else if (this.activeTab === 'python') {
        // Parse Python code to extract payload
        const jsonMatch = editorContent.match(/account_statement_data = ({[^}]+})/);
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
        // Parse PHP code to extract payload
        const jsonMatch = editorContent.match(/\$accountStatementData = (\[[^\]]+\])/);
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

      // Generate mock response
      this.responseStatus = 'success';
      this.apiResponse = JSON.stringify({
        status: true,
        message: "Success",
        data: [
          {
            id: 190013,
            user_id: 180099,
            type: "balance",
            order_id: "ZPXXXX120",
            amount: 9.7,
            remark: "Order Deduction",
            description: "Google Play E-Gift Voucher",
            opening_balance: 132.1,
            closing_balance: 122.4,
            status_id: 4,
            date: "2025-06-30T11:58:00.000000Z",
            status: {
              id: 4,
              status: "Debit"
            }
          },
          {
            id: 190014,
            user_id: 180099,
            type: "balance",
            order_id: "ZPXXXX121",
            amount: 50.0,
            remark: "Wallet Top-up",
            description: "Wallet Recharge",
            opening_balance: 122.4,
            closing_balance: 172.4,
            status_id: 3,
            date: "2025-06-29T09:30:00.000000Z",
            status: {
              id: 3,
              status: "Credit"
            }
          }
        ],
        pagination: {
          page: payload?.pagination?.page || 1,
          rowsPerPage: payload?.pagination?.rowsPerPage || 10,
          sortBy: payload?.pagination?.sortBy || "id",
          descending: payload?.pagination?.descending || true,
          total: 9
        }
      }, null, 2);

    } catch (error) {
      this.responseStatus = 'error';
      this.apiResponse = JSON.stringify({
        status: false,
        message: "Failed to fetch account statement",
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
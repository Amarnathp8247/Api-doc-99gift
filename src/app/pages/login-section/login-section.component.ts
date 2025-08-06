import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from "../../layouts/sidebar/sidebar.component";

declare const monaco: any; // Declare monaco since we're loading it via CDN

@Component({
  selector: 'app-login-section',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './login-section.component.html',
  styleUrls: ['./login-section.component.scss']
})
export class LoginSectionComponent implements AfterViewInit, OnDestroy {
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

  defaultCodeSamples: any = {
    curl: `curl -X POST \\
'https://api.99gift.in/user/login-Corporate/merchant' \\
-H 'Content-Type: application/json' \\
-d '{
  "mobile": "9182XXXXX94",
  "password": "test@123",
  "authcode": "128636"
}'`,
    javascript: `// Using Fetch API
const loginData = {
  mobile: "9182XXXXX94",
  password: "test@123",
  authcode: "128636"
};

fetch('https://api.99gift.in/user/login-Corporate/merchant', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(loginData)
})
.then(response => response.json())
.then(data => {
  console.log('Login successful:', data);
  localStorage.setItem('jwtToken', data.data);
})
.catch(error => console.error('Error:', error));`,
    python: `import requests

login_data = {
  "mobile": "9182XXXXX94",
  "password": "test@123",
  "authcode": "128636"
}

response = requests.post(
  "https://api.99gift.in/user/login-Corporate/merchant",
  json=login_data,
  headers={"Content-Type": "application/json"}
)

if response.status_code == 200:
  print("Login successful:", response.json())
  jwt_token = response.json().get("data")
else:
  print("Login failed:", response.text)`,
    php: `<?php
$loginData = [
  'mobile' => '9182XXXXX94',
  'password' => 'test@123',
  'authcode' => '128636'
];

$options = [
  'http' => [
    'header' => "Content-Type: application/json\r\n",
    'method' => 'POST',
    'content' => json_encode($loginData)
  ]
];

$context = stream_context_create($options);
$response = file_get_contents(
  'https://api.99gift.in/user/login-Corporate/merchant', 
  false, 
  $context
);

if ($response !== false) {
  $responseData = json_decode($response, true);
  echo "Login successful: ";
  print_r($responseData);
  $_SESSION['jwtToken'] = $responseData['data'];
} else {
  echo "Login failed";
}
?>`
  };

  codeSamples = { ...this.defaultCodeSamples };

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

      const loaderScript = document.createElement('script');
      loaderScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js';
      loaderScript.addEventListener('load', onGotAmdLoader);
      document.body.appendChild(loaderScript);
    }
  }

  private initializeMonacoEditor() {
    if (this.editorContainer && (this.isMonacoLoaded || typeof monaco !== 'undefined')) {
      this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
        value: this.codeSamples[this.activeTab],
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
              label: 'login-Corporate/merchant',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: 'Corporate merchant login endpoint',
              insertText: "'https://api.99gift.in/user/login-Corporate/merchant'",
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
        const match = editorContent.match(/const loginData = ({[\s\S]*?})/);
        if (!match) throw new Error('Invalid JS payload');
        payload = eval(`(${match[1]})`);
      } else if (this.activeTab === 'python') {
        const match = editorContent.match(/login_data = ({[\s\S]*?})/);
        if (!match) throw new Error('Invalid Python payload');
        payload = JSON.parse(match[1].replace(/'/g, '"'));
      } else if (this.activeTab === 'php') {
        const match = editorContent.match(/\$loginData = (\[[\s\S]*?\])/);
        if (!match) throw new Error('Invalid PHP payload');
        payload = JSON.parse(match[1].replace(/'/g, '"').replace(/=>/g, ':'));
      }

      if (payload.mobile !== '9182XXXXX94') throw new Error('Invalid credentials');

      await new Promise(resolve => setTimeout(resolve, 800));
      
      this.responseStatus = 'success';
      this.apiResponse = JSON.stringify({
        status: true,
        message: "Login Success!",
        data: "JWT_TOKEN_SAMPLE",
        user_detail: {
          id: 188699,
          email: "corptest@99gift.in",
          mobile: payload.mobile,
          balance: 180.6,
          name: "Test"
        },
        pagination: null
      }, null, 2);

    } catch (err) {
      this.responseStatus = 'error';
      this.apiResponse = JSON.stringify({
        status: false,
        message: (err instanceof Error ? err.message : 'Unknown error'),
        data: null
      }, null, 2);
    }
  }

  resetCode() {
    this.codeSamples = { ...this.defaultCodeSamples };
    if (this.editor) {
      this.editor.setValue(this.codeSamples[this.activeTab]);
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
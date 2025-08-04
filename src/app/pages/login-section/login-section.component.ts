import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import * as monaco from 'monaco-editor';
import { SidebarComponent } from "../../layouts/sidebar/sidebar.component";

@Component({
  selector: 'app-login-section',
  standalone: true,
  imports: [CommonModule, FormsModule, MonacoEditorModule, SidebarComponent],
  templateUrl: './login-section.component.html',
  styleUrls: ['./login-section.component.scss']
})
export class LoginSectionComponent implements AfterViewInit {
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

  // Default code samples
  defaultCodeSamples = {
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
  // Store the JWT token for future requests
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
  # Store the JWT token for future requests
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
    'header' => "Content-Type: application/json\\r\\n",
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
  // Store JWT token for future requests
  $_SESSION['jwtToken'] = $responseData['data'];
} else {
  echo "Login failed";
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
        const jsonMatch = editorContent.match(/const loginData = ({[^}]+})/);
        if (jsonMatch && jsonMatch[1]) {
          // Simple approach - in real app you might want a more robust parser
          payload = eval(`(${jsonMatch[1]})`);
        } else {
          throw new Error('Could not extract payload from JavaScript code');
        }
      } else if (this.activeTab === 'python') {
        // Parse Python code to extract payload
        const jsonMatch = editorContent.match(/login_data = ({[^}]+})/);
        if (jsonMatch && jsonMatch[1]) {
          // Convert Python dict syntax to JSON
          const pythonDict = jsonMatch[1]
            .replace(/'/g, '"')  // Replace single quotes with double quotes
            .replace(/True/g, 'true')  // Convert Python booleans
            .replace(/False/g, 'false');
          payload = JSON.parse(pythonDict);
        } else {
          throw new Error('Could not extract payload from Python code');
        }
      } else if (this.activeTab === 'php') {
        // Parse PHP code to extract payload
        const jsonMatch = editorContent.match(/\$loginData = (\[[^\]]+\])/);
        if (jsonMatch && jsonMatch[1]) {
          // Convert PHP array syntax to JSON
          const phpArray = jsonMatch[1]
            .replace(/'/g, '"')  // Replace single quotes with double quotes
            .replace(/=>/g, ':')  // Replace => with :
            .replace(/\$[a-zA-Z_]+/g, '"$&"');  // Wrap variables in quotes
          payload = JSON.parse(phpArray);
        } else {
          throw new Error('Could not extract payload from PHP code');
        }
      }

      // Define the allowed mobile number
      const ALLOWED_MOBILE = "9182XXXXX94";

      // Check if the mobile number matches the allowed number
      if (payload.mobile !== ALLOWED_MOBILE) {
        this.responseStatus = 'error';
        this.apiResponse = JSON.stringify({
          status: false,
          message: "Invalid API key or credentials",
          data: null,
          user_detail: null,
          pagination: null
        }, null, 2);
        return;
      }

      // Mock the successful response for the allowed number
      if (payload.mobile === ALLOWED_MOBILE) {
        this.responseStatus = 'success';
        this.apiResponse = JSON.stringify({
          status: true,
          message: "Login Success!",
          data: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3NTEyODI4NzAsIm5iZiI6MTc1",
          user_detail: {
            id: 188699,
            email: "corptest@99gift.in",
            mobile: ALLOWED_MOBILE,
            balance: 180.6,
            name: "Test"
          },
          pagination: null
        }, null, 2);
        return;
      }

      // Default error response
      this.responseStatus = 'error';
      this.apiResponse = JSON.stringify({
        status: false,
        message: "Authentication failed",
        data: null,
        user_detail: null,
        pagination: null
      }, null, 2);

    } catch (error) {
      this.responseStatus = 'error';
      this.apiResponse = JSON.stringify({
        error: 'Failed to parse code',
        details: error instanceof Error ? error.message : 'Unknown parsing error'
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
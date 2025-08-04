import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { SidebarComponent } from "../../layouts/sidebar/sidebar.component";
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as monaco from 'monaco-editor';
import { MonacoEditorModule } from 'ngx-monaco-editor';


@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, SidebarComponent, MonacoEditorModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
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
    curl: `curl -X GET \\
'https://api.99gift.in/user/validate-token' \\
-H 'Content-Type: application/json' \\
-H 'Authorization: Bearer YOUR_API_TOKEN'`,
    javascript: `// Using Fetch API
fetch('https://api.99gift.in/user/validate-token', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_TOKEN'
  }
})
.then(response => response.json())
.then(data => {
  console.log('Profile details:', data);
  // Handle the profile data
})
.catch(error => console.error('Error:', error));`,
    python: `import requests

response = requests.get(
  "https://api.99gift.in/user/validate-token",
  headers={
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_TOKEN"
  }
)

if response.status_code == 200:
  print("Profile details:", response.json())
else:
  print("Error:", response.text)`,
    php: `<?php
$options = [
  'http' => [
    'header' => "Content-Type: application/json\\r\\nAuthorization: Bearer YOUR_API_TOKEN\\r\\n",
    'method' => 'GET'
  ]
];

$context = stream_context_create($options);
$response = file_get_contents(
  'https://api.99gift.in/user/validate-token', 
  false, 
  $context
);

if ($response !== false) {
  $responseData = json_decode($response, true);
  echo "Profile details: ";
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

    // Extract the authorization header from the editor content
    const editorContent = this.editor.getValue();
    let hasAuthHeader = false;

    try {
      // Check for authorization header in all code samples
      if (this.activeTab === 'curl') {
        hasAuthHeader = editorContent.includes("Authorization: Bearer");
      } else if (this.activeTab === 'javascript') {
        hasAuthHeader = editorContent.includes("'Authorization'");
      } else if (this.activeTab === 'python') {
        hasAuthHeader = editorContent.includes('"Authorization"');
      } else if (this.activeTab === 'php') {
        hasAuthHeader = editorContent.includes("Authorization: Bearer");
      }

      if (!hasAuthHeader) {
        this.responseStatus = 'error';
        this.apiResponse = JSON.stringify({
          status: false,
          message: "Authorization token is required",
          data: null
        }, null, 2);
        return;
      }

      // Generate mock response
      this.responseStatus = 'success';
      this.apiResponse = JSON.stringify({
        status: true,
        message: "User details!",
        data: {
          id: 12345,
          name: "Amarnath",
          mobile: "XXXXXXX",
          email: "XXXX@99gift.in",
          balance: 180.6,
          corporate_name: null,
          pin_code: null
        }
      }, null, 2);

    } catch (error) {
      this.responseStatus = 'error';
      this.apiResponse = JSON.stringify({
        status: false,
        message: "Failed to fetch profile details",
        data: null
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
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { SidebarComponent } from "../../layouts/sidebar/sidebar.component";
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as monaco from 'monaco-editor';
import { MonacoEditorModule } from 'ngx-monaco-editor';

@Component({
  selector: 'app-product-list-docs',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, MonacoEditorModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements AfterViewInit {
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
    search: "",
    filterBy: "title",
    selectedCategories: [],
    pagination: {
      sortBy: "id",
      descending: false,
      page: 1,
      rowsPerPage: 0,
      rowsNumber: 0
    }
  };

  // Default code samples
  defaultCodeSamples = {
    curl: `curl -X POST \\
'https://api.99gift.in/list' \\
-H 'Content-Type: application/json' \\
-H 'Authorization: Bearer YOUR_API_KEY' \\
-d '${JSON.stringify(this.defaultRequestPayload, null, 2)}'`,
    javascript: `// Using Fetch API
const productListData = ${JSON.stringify(this.defaultRequestPayload, null, 2)};

fetch('https://api.99gift.in/list', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify(productListData)
})
.then(response => response.json())
.then(data => {
  console.log('Product list:', data);
  // Handle the product list data
})
.catch(error => console.error('Error:', error));`,
    python: `import requests

product_list_data = ${JSON.stringify(this.defaultRequestPayload, null, 2)}

response = requests.post(
  "https://api.99gift.in/list",
  json=product_list_data,
  headers={
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
  }
)

if response.status_code == 200:
  print("Product list:", response.json())
else:
  print("Error:", response.text)`,
    php: `<?php
$productListData = ${JSON.stringify(this.defaultRequestPayload, null, 2)};

$options = [
  'http' => [
    'header' => "Content-Type: application/json\\r\\nAuthorization: Bearer YOUR_API_KEY\\r\\n",
    'method' => 'POST',
    'content' => json_encode($productListData)
  ]
];

$context = stream_context_create($options);
$response = file_get_contents(
  'https://api.99gift.in/list', 
  false, 
  $context
);

if ($response !== false) {
  $responseData = json_decode($response, true);
  echo "Product list: ";
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
    let hasAuthHeader = false;

    try {
      // Check for authorization header in all code samples
      if (this.activeTab === 'curl') {
        hasAuthHeader = editorContent.includes("Authorization: Bearer");
        const jsonMatch = editorContent.match(/-d\s+'([^']+)'/);
        if (jsonMatch && jsonMatch[1]) {
          payload = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Could not extract JSON payload from curl command');
        }
      } else if (this.activeTab === 'javascript') {
        hasAuthHeader = editorContent.includes("'Authorization'");
        const jsonMatch = editorContent.match(/const productListData = ({[^}]+})/);
        if (jsonMatch && jsonMatch[1]) {
          payload = eval(`(${jsonMatch[1]})`);
        } else {
          throw new Error('Could not extract payload from JavaScript code');
        }
      } else if (this.activeTab === 'python') {
        hasAuthHeader = editorContent.includes("'Authorization'");
        const jsonMatch = editorContent.match(/product_list_data = ({[^}]+})/);
        if (jsonMatch && jsonMatch[1]) {
          const pythonDict = jsonMatch[1]
            .replace(/'/g, '"')
            .replace(/True/g, 'true')
            .replace(/False/g, 'false');
          payload = JSON.parse(pythonDict);
        } else {
          throw new Error('Could not extract payload from Python code');
        }
      } else if (this.activeTab === 'php') {
        hasAuthHeader = editorContent.includes("Authorization: Bearer");
        const jsonMatch = editorContent.match(/\$productListData = (\[[^\]]+\])/);
        if (jsonMatch && jsonMatch[1]) {
          const phpArray = jsonMatch[1]
            .replace(/'/g, '"')
            .replace(/=>/g, ':')
            .replace(/\$[a-zA-Z_]+/g, '"$&"');
          payload = JSON.parse(phpArray);
        } else {
          throw new Error('Could not extract payload from PHP code');
        }
      }

      // First check for authorization
      if (!hasAuthHeader) {
        this.responseStatus = 'error';
        this.apiResponse = JSON.stringify({
          status: false,
          message: "Invalid API key or credentials",
          data: null,
          pagination: null
        }, null, 2);
        return;
      }

      // Generate mock response based on the request payload
      const searchTerm = payload.search?.toLowerCase() || '';
      const categoryFilter = payload.selectedCategories || [];
      
      const allProducts = [
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
        },
        {
          id: 695,
          sku: "OFFAMAZONNW",
          title: "Amazon Pay E-Gift Voucher",
          image: "https://99paisa.s3.amazonaws.com/fund--request/amazon_voucher.jpg",
          website: 1,
          store: 0,
          min_price: 100,
          max_price: 1000,
          discount_type: "percentage",
          points: 0,
          corp_discount: 5,
          category: {
            id: 6,
            title: "Entertainment",
            status: 1
          }
        },
        {
          id: 696,
          sku: "FLIPKARTGV",
          title: "Flipkart Gift Voucher",
          image: "https://99paisa.s3.amazonaws.com/fund--request/flipkart_voucher.jpg",
          website: 1,
          store: 0,
          min_price: 500,
          max_price: 5000,
          discount_type: "percentage",
          points: 0,
          corp_discount: 4,
          category: {
            id: 7,
            title: "Shopping",
            status: 1
          }
        }
      ];

      // Filter products based on search and category
      const filteredProducts = allProducts.filter(product => {
        const matchesSearch = searchTerm === '' || 
          product.title.toLowerCase().includes(searchTerm) || 
          product.sku.toLowerCase().includes(searchTerm);
        
        const matchesCategory = categoryFilter.length === 0 || 
          categoryFilter.includes(product.category.id);
        
        return matchesSearch && matchesCategory;
      });

      // Apply pagination
      const pagination = payload.pagination || { page: 1, rowsPerPage: 0 };
      const startIndex = (pagination.page - 1) * pagination.rowsPerPage;
      const endIndex = startIndex + pagination.rowsPerPage;
      const paginatedProducts = pagination.rowsPerPage > 0 ? 
        filteredProducts.slice(startIndex, endIndex) : 
        filteredProducts;

      this.responseStatus = 'success';
      this.apiResponse = JSON.stringify({
        status: true,
        message: "Product list retrieved successfully",
        data: paginatedProducts,
        pagination: {
          page: pagination.page,
          rowsPerPage: pagination.rowsPerPage,
          sortBy: pagination.sortBy || "id",
          descending: pagination.descending || false,
          total: filteredProducts.length
        }
      }, null, 2);

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
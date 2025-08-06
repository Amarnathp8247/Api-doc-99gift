import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from "../../layouts/sidebar/sidebar.component";

declare const monaco: any;
@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './product-search.component.html',
  styleUrls: ['./product-search.component.scss']
})
export class ProductSearchComponent implements AfterViewInit, OnDestroy {
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
    search: "Amazone",
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

  defaultCodeSamples = {
    curl: `curl -X POST \\
'https://api.99gift.in/list' \\
-H 'Content-Type: application/json' \\
-d '${JSON.stringify(this.defaultRequestPayload, null, 2)}'`,
    javascript: `// Using Fetch API
const productListData = ${JSON.stringify(this.defaultRequestPayload, null, 2)};

fetch('https://api.99gift.in/list', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
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
  headers={"Content-Type": "application/json"}
)

if response.status_code == 200:
  print("Product list:", response.json())
else:
  print("Error:", response.text)`,
    php: `<?php
$productListData = ${JSON.stringify(this.defaultRequestPayload, null, 2)};

$options = [
  'http' => [
    'header' => "Content-Type: application/json\\r\\n",
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
          label: 'list',
          kind: monaco.languages.CompletionItemKind.Function,
          documentation: 'Product search endpoint',
          insertText: "'https://api.99gift.in/list'",
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
      let payload: any;

      if (this.activeTab === 'curl') {
        const jsonMatch = editorContent.match(/-d\s+'([^']+)'/);
        if (jsonMatch && jsonMatch[1]) {
          payload = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Could not extract JSON payload from curl command');
        }
      } else if (this.activeTab === 'javascript') {
        const jsonMatch = editorContent.match(/const productListData = ({[^}]+})/);
        if (jsonMatch && jsonMatch[1]) {
          payload = eval(`(${jsonMatch[1]})`);
        } else {
          throw new Error('Could not extract payload from JavaScript code');
        }
      } else if (this.activeTab === 'python') {
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

      // Simulate API delay
      setTimeout(() => {
        const searchTerm = payload.search?.toLowerCase() || '';
        
        // Check for valid search term (Amazon/Amazone)
        if (!['amazon', 'amazone'].includes(searchTerm)) {
          this.responseStatus = 'error';
          this.apiResponse = JSON.stringify({
            status: false,
            message: "No products found matching your search",
            data: [],
            pagination: {
              page: 1,
              rowsPerPage: 0,
              sortBy: "id",
              descending: false,
              total: 0
            }
          }, null, 2);
          return;
        }

        const categoryFilter = payload.selectedCategories || [];
        
        // Mock product data
        const allProducts = [
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
          }
        ];

        // Filter products based on search and category
        const filteredProducts = allProducts.filter(product => {
          const matchesSearch = product.title.toLowerCase().includes('amazon') || 
                              product.sku.toLowerCase().includes('amazon');
          
          const matchesCategory = categoryFilter.length === 0 || 
            categoryFilter.includes(product.category.id);
          
          return matchesSearch && matchesCategory;
        });

        // Apply sorting
        const sortBy: keyof typeof allProducts[0] = payload.pagination?.sortBy || "id";
        const descending = payload.pagination?.descending || false;
        
        filteredProducts.sort((a, b) => {
          if (a[sortBy] < b[sortBy]) return descending ? 1 : -1;
          if (a[sortBy] > b[sortBy]) return descending ? -1 : 1; // Ensure sortBy is a valid key
          return 0;
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
            sortBy: sortBy,
            descending: descending,
            total: filteredProducts.length
          }
        }, null, 2);
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
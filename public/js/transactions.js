const myModal = new bootstrap.Modal("#transaction-modal");
let logged = sessionStorage.getItem("logged");
const session = localStorage.getItem("session");
let data = {
  transactions: [],
};
let transactionIndex = 0;
let transactionToRemove = null;
document.getElementById("button-logout").addEventListener("click", logout);

function logout() {
  sessionStorage.removeItem("logged");
  localStorage.removeItem("session");
  window.location.href = "index.html";
}

document
  .getElementById("transaction-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const value = parseFloat(document.getElementById("value-input").value);
    const description = document.getElementById("description-input").value;
    const date = document.getElementById("date-input").value;
    const type = document.querySelector(
      'input[name="type-input"]:checked'
    ).value;

    data.transactions.unshift({
      value: value,
      description: description,
      date: date,
      type: type,
    });

    saveData(data);
    e.target.reset();
    myModal.hide();

    getTransactions();

    alert("Lançamento adicionado com sucesso!");
  });
document
  .getElementById("edit-transaction-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const value = parseFloat(document.getElementById("edit-value-input").value);
    const description = document.getElementById("edit-description-input").value;
    const date = document.getElementById("edit-date-input").value;
    const type = document.querySelector(
      'input[name="edit-type-input"]:checked'
    ).value;

    const newTransaction = {
      value: value,
      description: description,
      date: date,
      type: type,
    };

    updateTransaction(transactionIndex, newTransaction);
    const editModal = bootstrap.Modal.getInstance(
      document.getElementById("edit-modal")
    );
    editModal.hide();

    alert("Lançamento editado com sucesso!");
  });
checkedLogged();

function checkedLogged() {
  if (session) {
    sessionStorage.setItem("logged", session);
    logged = session;
  }

  if (!logged) {
    window.location.href = "index.html";
    return;
  }

  const dataUser = localStorage.getItem(logged);
  if (dataUser) {
    data = JSON.parse(dataUser);
  }
  getTransactions();
  console.log(data);
}

function getTransactions() {
  const transactions = data.transactions;
  let transactionsHtml = "";

  if (transactions.length) {
    transactions.forEach((item, index) => {
      let type = "Entrada";
      if (item.type === "2") {
        type = "Saída";
      }

      transactionsHtml += `
  <tr>
    <th scope="row">${item.date.split("-").reverse().join("-")}</th>
    <td>${item.value.toFixed(2)}</td>
    <td>${type}</td>
    <td class="description-cel">${item.description}</td>
    <td id="actions">
      <button class="btn btn-sm btn-primary" 
              data-bs-toggle="modal"
              data-bs-target="#edit-modal"
              onclick="getTransactionDetails(${index})">
        <i class="bi bi-pencil-fill"></i>
      </button>
      <button class="btn btn-sm btn-danger"
              data-bs-toggle="modal"
              data-bs-target="#remove-modal"
              onclick="setTransactionToRemove(${index})">
        <i class="bi bi-trash2-fill"></i>
      </button>
    </td>
  </tr>
`;
    });
  }
  document.getElementById("transactions-list").innerHTML = transactionsHtml;
}

function removeTransaction() {
  if (transactionToRemove === null) return;

  data.transactions.splice(transactionToRemove, 1);
  saveData(data);
  getTransactions();

  transactionToRemove = null;

  const removeModal = bootstrap.Modal.getInstance(
    document.getElementById("remove-modal")
  );
  removeModal.hide();

  alert("Transação removida com sucesso!");
}

function setTransactionToRemove(index) {
  transactionToRemove = index;

  const transaction = data.transactions[index];
  descriptionView.innerText = "Descrição: " + transaction.description;
  dateView.innerText =
    "Data: " + transaction.date.split("-").reverse().join("-");
  valueView.innerText = "Valor: R$ " + transaction.value.toFixed(2);
  typeView.innerText =
    "Tipo: " + (transaction.type === "1" ? "Entrada" : "Saída");
}
function updateTransaction(index, newData) {
  data.transactions[index] = newData;
  saveData(data);
  getTransactions();
}

const descriptionView = document.getElementById("description-view");
const dateView = document.getElementById("date-view");
const typeView = document.getElementById("type-view");
const valueView = document.getElementById("value-view");

function getTransactionDetails(index) {
  transactionIndex = index;

  const transaction = data.transactions[index];

  document.getElementById("edit-value-input").value = transaction.value;
  document.getElementById("edit-description-input").value =
    transaction.description;
  document.getElementById("edit-date-input").value = transaction.date;

  const radioId =
    transaction.type === "1" ? "edit-inlineRadio1" : "edit-inlineRadio2";
  document.getElementById(radioId).checked = true;

  descriptionView.innerText = "Descrição: " + transaction.description;
  dateView.innerText =
    "Data: " + transaction.date.split("-").reverse().join("-");
  valueView.innerText = "Valor: R$ " + transaction.value.toFixed(2);
  typeView.innerText =
    "Tipo: " + (transaction.type === "1" ? "Entrada" : "Saída");
}

function generateReport() {
  console.log("generateReport() called");
  if (data.transactions.length === 0) {
    console.log("No transactions to generate report.");
    alert("Nenhuma transação para gerar o relatório.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const username = logged.split("@")[0];
  const firstLetter = username.charAt(0).toUpperCase();
  const restOfName = username.slice(1);
  const formattedUsername = firstLetter + restOfName;
  doc.setFontSize(16);
  doc.text(`Relatório de Transações de ${formattedUsername}`, 14, 10);

  doc.setFontSize(12);
  let yPosition = 30;

  console.log("Transactions to generate report:");
  console.log(data.transactions);

  data.transactions.forEach((transaction, index) => {
    console.log(`Transaction ${index + 1}:`);
    console.log(transaction);
    const type = transaction.type === "1" ? "Entrada" : "Saída";
    const date = transaction.date.split("-").reverse().join("-");
    const value = transaction.value.toFixed(2);
    const description = transaction.description;
    const splitDescription = doc.splitTextToSize(description, 170);
    const headerText = `${
      index + 1
    }. Data: ${date} | Tipo: ${type} | Valor: R$ ${value} | Descrição: `;
    doc.text(headerText, 14, yPosition);

    yPosition += 10;

    splitDescription.forEach((line) => {
      doc.text(line, 20, yPosition);

      yPosition += 10;

      if (yPosition > 280) {
        console.log("Adding new page to PDF.");
        doc.addPage();
        yPosition = 20;
      }
    });
  });
  console.log("Saving PDF report.");
  doc.save("relatorio-transacoes.pdf");
}

function saveData(data) {
  localStorage.setItem(data.login, JSON.stringify(data));
}

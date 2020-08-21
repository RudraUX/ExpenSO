//NOTE this is Budget Controller
const budgetController = (function () {
  let Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  let Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  const calculate = function (type) {
    let sum = 0;
    data.allItems[type].forEach((element) => {
      sum = sum + element.value;
    });

    data.totals[type] = sum;
  };

  const data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1, //-1 because it doesn't exist
  };

  return {
    addItem: function (type, des, val) {
      let newItem, ID;

      //create new id
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //creating new item base on 'inc' and 'exp' type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }
      //push it to our data structure
      data.allItems[type].push(newItem);
      //return the new element
      return newItem;
    },
    deleteItem: function (type, id) {
      let ids = data.allItems[type].map(function (cur) {
        //cur is an object which is an element of type array
        return cur.id;
      });

      let index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    calculateBudget: function () {
      //calculate the income and expense
      calculate("inc");
      calculate("exp");
      //calculate the budget : income - expense
      data.budget = data.totals.inc - data.totals.exp;
      //calculate the percentage
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1; //nonexistence
      }
    },
    calculatePercentage: function () {},
    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExpense: data.totals.exp,
        percentage: data.percentage,
      };
    },
    testing: function () {
      console.log(data);
    },
  };
})();

//NOTE this is UI controller
const UIController = (function () {
  let domStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputButton: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
  };
  return {
    getItem: function () {
      return {
        type: document.querySelector(domStrings.inputType).value, //will be inc or exp
        description: document.querySelector(domStrings.inputDescription).value,
        value: parseFloat(document.querySelector(domStrings.inputValue).value),
      };
    },
    addListItem: function (obj, type) {
      //create a HTML string with a placeholder text
      var html, newHtml, element;
      if (type === "inc") {
        element = domStrings.incomeContainer;

        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = domStrings.expenseContainer;

        html =
          '<div class="item clearfix" id="exp-%id%"><div div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div > ';
      }
      //replace the place holder text with an actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", obj.value);
      //insert the html inside the dom
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },
    deleteListItem: function (selectorId) {
      let el = document.getElementById(selectorId);
      el.parentNode.removeChild(el);
    },
    clearFields: function () {
      let fields, fieldsArr;
      fields = document.querySelectorAll(
        domStrings.inputDescription + ", " + domStrings.inputValue
      );
      //this is because fields returns a list which isn't an array
      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach((element) => {
        element.value = "";
      });

      fieldsArr[0].focus();
    },
    displayBudget: function (obj) {
      document.querySelector(domStrings.budgetLabel).textContent = obj.budget;
      document.querySelector(domStrings.incomeLabel).textContent = obj.totalInc;
      document.querySelector(domStrings.expenseLabel).textContent =
        obj.totalExpense;
      if (obj.percentage > 0) {
        document.querySelector(domStrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(domStrings.percentageLabel).textContent = "---";
      }
    },
    getDomStrings: function () {
      return domStrings;
    },
  };
})();

//NOTE this is GLOBAL controller
const controller = (function (budgetC, UIc) {
  let setupEventListener = function () {
    let DOM = UIc.getDomStrings();
    document
      .querySelector(DOM.inputButton)
      .addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
  };

  //updating budget

  const updateBudget = function () {
    //calculate the budget
    budgetC.calculateBudget();
    //return the budget
    let budget = budgetC.getBudget();
    //Display the budget on the UI
    UIc.displayBudget(budget);
  };
  //updating percentages

  const updatePercentage = function () {
    //calculate the percentage
    budgetC.calculatePercentage();
    //retune the percentage

    //Display the percentage on the UI
  };
  const ctrlAddItem = function () {
    //Get data from input field
    let input = UIc.getItem();
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //add item to the budget controller
      let newItem = budgetC.addItem(input.type, input.description, input.value);
      //add item to the UI
      UIc.addListItem(newItem, input.type);
      //for clear the fields
      UIc.clearFields();
      //calculate and update budget
      updateBudget();
      //calculate and update percentage
      updatePercentage();
    }
  };

  const ctrlDeleteItem = function (event) {
    let itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemId) {
      let splitId = itemId.split("-");
      let type = splitId[0];
      let ID = parseInt(splitId[1]);

      //delete the item from data structure
      budgetC.deleteItem(type, ID);
      //delete the item from UI
      UIc.deleteListItem(itemId);
      //Update the budget
      updateBudget();
      //calculate and update percentage
      updatePercentage();
    }
  };

  return {
    init: function () {
      setupEventListener();
      UIc.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExpense: 0,
        percentage: -1,
      });
    },
  };
})(budgetController, UIController);

controller.init();

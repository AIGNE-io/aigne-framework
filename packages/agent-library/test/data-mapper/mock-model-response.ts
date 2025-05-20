export const resultBasic = {
  jsonata:
    '{\n  "sectionsData": {\n    "ContentSearchResult": {\n      "sourceList": $map($.searchResult.organic_results, function($v){\n        {\n          "title": $v.title,\n          "link": $v.link,\n          "favicon": $v.favicon,\n          "source": $v.source\n        }\n      })\n    },\n    "contentSummarize": {\n      "summarizeData": {\n        "summarizeContent": $.summarizeData.content,\n        "summarizeImage": ($.summarizeImage[0] ? $.summarizeImage[0].url : ""),\n        "summarizeAuthor": {\n          "name": $.summarizeData.author.name,\n          "age": $number($.summarizeData.author.age)\n        }\n      }\n    },\n    "ContentReleated": {\n      "releatedQuestions": $map($.releatedData.releatedQuestions, function($q) { { "question": $q } })\n    },\n    "ContentMain": {\n      "content": $.content\n    }\n  }\n}',
  confidence: 95,
  confidenceReasoning:
    "Field mapping is based on available source data with focused field selection for known keys.\nThe JSONata expression was corrected from previous feedback using $map and proper syntax for array handling. \nLow confidence exists if any field unexpectedly results in null. Furthermore, urls and fields could rely on changes in index or data availability.",
};

export const resultComplex = {
  jsonata:
    '{\n  "product": {\n    "basicInfo": {\n      "name": $.rawProduct.info.productName,\n      "price": $.rawProduct.info.price,\n      "description": $.rawProduct.info.desc\n    },\n    "specifications": [\n      $.rawProduct.specs.{\n        "name": specName,\n        "value": specValue,\n        "unit": specUnit\n      }\n    ],\n    "reviews": [\n      $.rawProduct.userReviews.{\n        "user": {\n          "name": reviewer.userName,\n          "level": reviewer.userLevel\n        },\n        "content": reviewText,\n        "rating": score,\n        "images": [\n          reviewer.reviewImages.{\n            "url": imageUrl,\n            "type": imageType\n          }\n        ]\n      }\n    ]\n  }\n}',
  confidence: 85,
  confidenceReasoning:
    "The expression maps the source fields according to the provided schema. However, some assumptions had to be made about the structure of certain nested fields (like the review images) and their existence, which introduces a small margin of error.",
};

export const resultArray = {
  jsonata:
    '{\n  "order": {\n    "orderId": orderData.id,\n    "status": orderData.orderStatus,\n    "items": [\n      orderData.products.{\n        "productId": id,\n        "quantity": qty,\n        "price": unitPrice,\n        "discount": discountRate\n      }\n    ],\n    "shipping": {\n      "address": orderData.delivery.shippingAddress,\n      "method": orderData.delivery.shippingMethod,\n      "cost": orderData.delivery.shippingFee\n    },\n    "payment": {\n      "method": orderData.paymentInfo.paymentMethod,\n      "status": orderData.paymentInfo.paymentStatus,\n      "amount": orderData.paymentInfo.totalAmount\n    }\n  }\n}',
  confidence: 90,
  confidenceReasoning:
    "The JSONata expression accurately maps the provided source data fields to the specified target schema fields while conforming to the required transformations. All necessary fields are accounted for, with standardized naming and correct type handling.",
};

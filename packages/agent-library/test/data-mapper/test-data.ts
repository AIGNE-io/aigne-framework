export const testData = {
  responseSchema: `{"type":"object","properties":{"title":{"type":"string"},"image":{"type":"string"},"description":{"type":"string"},"sectionsData":{"type":"object","properties":{"ContentHero":{"type":"object","properties":{"title":{"type":"string"},"heroImage":{"type":"object","properties":{"url":{"type":"string"},"mediaKitUrl":{"type":"string"},"width":{"type":"number"},"height":{"type":"number"}}}},"description":"忽略 ContentHero ，ContentHero 的数据由用户设置。"},"ContentSearchResult":{"type":"object","properties":{"sourceList":{"type":"array","items":{"type":"object","properties":{"title":{"type":"string"},"link":{"type":"string"},"favicon":{"type":"string"},"source":{"type":"string"}}}}},"description":""},"ContentMain":{"type":"object","properties":{"content":{"type":"string"}}},"contentSummarize":{"type":"object","properties":{"summarizeData":{"type":"object","properties":{"summarizeContent":{"type":"string"},"summarizeImage":{"type":"string"},"summarizeAuthor":{"type":"object","properties":{"name":{"type":"string"},"age":{"type":"number"}}}}}},"description":"显示总结信息"},"ContentReleated":{"type":"object","properties":{"releatedQuestions":{"type":"array","items":{"type":"object","properties":{"question":{"type":"string"}}}},"releatedPath":{"type":"string"}},"description":"忽略 releatedPath 字段，这个字段由用户设置。"}},"description":"包含页面的所有部分数据"}}}`,
  sourceSchema: `{"type":"object","properties":{"$text":{"type":"string"},"releatedData":{"type":"object","properties":{"releatedQuestions":{"type":"array","items":{"type":"string"}}}},"searchResult":{"type":"object"},"summarizeData":{"type":"object","properties":{"content":{"type":"string"},"author":{"type":"object","properties":{"name":{"type":"string"},"age":{"type":"number"}}}}},"summarizeImage":{"type":"array","items":{"type":"object","properties":{"url":{"type":"string"}}}}}}`,
  sourceData: `{"$text":"选择适合的分析工具时，可以考虑以下几个关键因素：\\n\\n## 1. 功能和特点\\n\\n首先，要明确分析工具的基本功能和特点，确保它们能够满足你的需求。例如，某些工具可能擅长处理特定类型的数据（如数字数据、文本数据等），而其他工具则可能在数据可视化、统计分析等方面更为强大。根据你的分析目的，选择相应的工具非常重要[6][7]。\\n\\n## 2. 成本和许可证\\n\\n考虑工具的费用结构，包括购买成本、维护成本和其他潜在费用。很多企业级数据分析工具需要支付高昂的许可证费用，而对于小型企业或个人用户，性价比高的免费工具也是不错的选择[3][4]。\\n\\n## 3. 易用性和学习曲线\\n\\n某些分析工具的学习曲线较陡峭，可能需要更多的培训和学习时间。因此，如果团队的成员对数据分析的经验较少，选择一个界面友好、易于上手的工具将更为适宜。例如，Excel和Tableau是初学者的常见选择，其操作相对直观[9][10]。\\n\\n## 4. 数据隐私和安全性\\n\\n随着数据隐私法规的逐渐严格，确保所选工具能够有效保护数据隐私和安全也是必不可少的。这一点对于企业尤为重要，在选择工具时应仔细审查其安全特性和符合的法规标准[5].\\n\\n## 5. 社区和支持\\n\\n良好的社区支持和技术支持能够帮助用户在遇到问题时获得及时的解决方案。查看工具的用户社区活跃程度、官方文档和版本更新频率，都能反映出工具的稳定性和活跃程度[8]。\\n\\n结合以上因素，用户可以更好地选择出适合其特定需求的数据分析工具。这一过程不仅仅是挑选工具，更是要考虑工具如何与实际工作流程相结合以提升效率和效果。","releatedData":{"releatedQuestions":["有哪些推荐的分析工具？","工具的学习成本如何？","如何评估工具的安全性？","哪种工具最适合小型企业？","大数据分析需要哪些专用工具？"]},"searchResult":{"search_metadata":{"id":"67d795de0fb229fe616483ec","status":"Success","json_endpoint":"https://serpapi.com/searches/612d160a5d9ebeef/67d795de0fb229fe616483ec.json","created_at":"2025-03-17 03:24:14 UTC","processed_at":"2025-03-17 03:24:14 UTC","google_url":"https://www.google.com/search?q=%E5%A6%82%E4%BD%95%E9%80%89%E6%8B%A9%E9%80%82%E5%90%88%E7%9A%84%E5%88%86%E6%9E%90%E5%B7%A5%E5%85%B7%EF%BC%9F&oq=%E5%A6%82%E4%BD%95%E9%80%89%E6%8B%A9%E9%80%82%E7%9A%84%E5%88%86%E6%9E%90%E5%B7%A5%E5%85%B7%EF%BC%9F&sourceid=chrome&ie=UTF-8","raw_html_file":"https://serpapi.com/searches/612d160a5d9ebeef/67d795de0fb229fe616483ec.html","total_time_taken":4.35},"search_parameters":{"engine":"google","q":"如何选择适合的分析工具？","google_domain":"google.com","device":"desktop"},"search_information":{"query_displayed":"如何选择适合的分析工具？","total_results":168000000,"time_taken_displayed":0.42,"organic_results_state":"Results for exact spelling"},"organic_results":[{"position":1,"title":"数据分析工具怎么选？10大谏言！","link":"https://zhuanlan.zhihu.com/p/432495516","redirect_link":"https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://zhuanlan.zhihu.com/p/432495516&ved=2ahUKEwicpJyVlZCMAxWGRkEAHfKMD1EQFnoECBYQAQ","displayed_link":"https://zhuanlan.zhihu.com › ...","favicon":"https://serpapi.com/searches/67d795de0fb229fe616483ec/images/ba7f274fcd3ab370bb901f321bd7401151af6558852dad844c826927c27e8c01.png","date":"Nov 12, 2021","snippet":"这就要看企业的数据架构。站在IT的角度，实际应用中可以把数据工具分为两个维度：第一维度：数据存储层——数据报表层——数据分析层——数据展现层第二维度：用户级 ...","snippet_highlighted_words":["工具","分析"],"source":"知乎专栏"},{"position":2,"title":"数据分析的25个顶级工具和最佳选择","link":"https://www.qrcode-tiger.com/zh-cn/tools-for-data-analysis","redirect_link":"https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://www.qrcode-tiger.com/zh-cn/tools-for-data-analysis&ved=2ahUKEwicpJyVlZCMAxWGRkEAHfKMD1EQFnoECBsQAQ","displayed_link":"https://www.qrcode-tiger.com › to...","favicon":"https://serpapi.com/searches/67d795de0fb229fe616483ec/images/ba7f274fcd3ab370bb901f321bd74011afdba4c3f608f6cb0160ca62c50a653a.png","date":"Feb 3, 2025","snippet":"从具有内置分析功能的QR码生成器到CRM分析平台，选择合适的工具可以将您的分析转化为竞争优势。 ... 专注于这几个关键方面，选择适合您需求的工具。","snippet_highlighted_words":["分析","分析","选择","工具","分析","选择适合","工具"],"source":"QR Tiger"},{"position":3,"title":"常见的数据分析工具：如何选择最适合你的工具？","link":"https://www.guandata.com/gy/post/9.html","redirect_link":"https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://www.guandata.com/gy/post/9.html&ved=2ahUKEwicpJyVlZCMAxWGRkEAHfKMD1EQFnoECBcQAQ","displayed_link":"https://www.guandata.com › post","favicon":"https://serpapi.com/searches/67d795de0fb229fe616483ec/images/ba7f274fcd3ab370bb901f321bd74011dbfaff9959ac78cb4730024dcbb308a0.png","date":"Oct 18, 2024","snippet":"首先，你需要明确自己的任务需求。 不同的工具适用于不同的任务，例如Excel适用于简单的数据处理和分析，而Python适用于复杂的数据处理和建模。 根据自己的 ...","source":"观远BI"},{"position":4,"title":"10种强大的数据分析工具，根据用途来选择最适合你的！","link":"https://vicedu.com/10%E7%A7%8D%E5%BC%BA%E5%A4%A7%E7%9A%84%E6%95%B0%E6%8D%AE%E5%88%86%E6%9E%90%E5%B7%A5%E5%85%B7%EF%BC%8C%E6%A0%B9%E6%8D%AE%E7%94%A8%E9%80%94%E6%9D%A5%E9%80%89%E6%8B%A9%E6%9C%80%E9%80%82%E5%90%88%E4%BD%A0/","redirect_link":"https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://vicedu.com/10%25E7%25A7%258D%25E5%25BC%25BA%25E5%25A4%25A7%25E7%259A%2584%25E6%2595%25B0%25E6%258D%25AE%25E5%2588%2586%25E6%259E%2590%25E5%25B7%25A5%25E5%2585%25B7%25EF%25BC%258C%25E6%25A0%25B9%25E6%258D%25AE%25E7%2594%25A8%25E9%2580%2594%25E6%259D%25A5%25E9%2580%2589%25E6%258B%25A9%25E6%259C%2580%25E9%2580%2582%25E5%2590%2588%25E4%25BD%25A0/&ved=2ahUKEwicpJyVlZCMAxWGRkEAHfKMD1EQFnoECBoQAQ","displayed_link":"https://vicedu.com › 10种强大的...","favicon":"https://serpapi.com/searches/67d795de0fb229fe616483ec/images/ba7f274fcd3ab370bb901f321bd74011e71b60c980dfb372b95249282d41cbe4.png","date":"Mar 12, 2024","snippet":"10种强大的数据分析工具，根据用途来选择最适合你的！ · 1、Datawrapper · 2、Microsoft Excel 和Power BI · 3、Qlik · 4、Google Analytics · 5、Spotfire.","snippet_highlighted_words":["1、Datawrapper"],"source":"VICEDU"},{"position":5,"title":"数据分析常用工具推荐，如何选择适合的分析工具","link":"https://www.sohu.com/a/819449904_122053164","redirect_link":"https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://www.sohu.com/a/819449904_122053164&ved=2ahUKEwicpJyVlZCMAxWGRkEAHfKMD1EQFnoECBUQAQ","displayed_link":"https://www.sohu.com › ...","favicon":"https://serpapi.com/searches/67d795de0fb229fe616483ec/images/ba7f274fcd3ab370bb901f321bd740114d4ec120c08fa1b41b2a79883ca43829.png","date":"Oct 23, 2024","snippet":"一、选择数据分析工具的关键因素 · 二、常用的数据分析工具推荐 · 三、如何选择合适的工具 · 四、CDA认证的重要性.","snippet_highlighted_words":["选择","分析工具","分析工具","如何选择","工具"],"source":"搜狐网"},{"position":6,"title":"2024 年最佳数据分析工具+ 选择正确工具的指南","link":"https://www.astera.com/zh-CN/type/blog/data-profiling-tools/","redirect_link":"https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://www.astera.com/zh-CN/type/blog/data-profiling-tools/&ved=2ahUKEwicpJyVlZCMAxWGRkEAHfKMD1EQFnoECBkQAQ","displayed_link":"https://www.astera.com › blog › d...","favicon":"https://serpapi.com/searches/67d795de0fb229fe616483ec/images/ba7f274fcd3ab370bb901f321bd74011ec21ce9c3fcb906eef094d1b6b63ce01.png","snippet":"选择数据分析工具时要考虑的因素 · 数据类型和格式： 选择数据分析工具时首要考虑的因素是其处理各种数据类型和格式的能力。 · 可扩展性和性能： 组织生成和处理的数据量正在 ...","snippet_highlighted_words":["选择","分析工具","选择","分析工具"],"source":"Astera Software"},{"position":7,"title":"4款热门数据分析工具大比拼！哪款更适合你的企业？","link":"https://www.finebi.com/da/rmshjfxgjdbp","redirect_link":"https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://www.finebi.com/da/rmshjfxgjdbp&ved=2ahUKEwicpJyVlZCMAxWGRkEAHfKMD1EQFnoECBgQAQ","displayed_link":"https://www.finebi.com › rmshjfx...","favicon":"https://serpapi.com/searches/67d795de0fb229fe616483ec/images/ba7f274fcd3ab370bb901f321bd74011946d8d890a3a34d9b00179511478117a.png","date":"Dec 21, 2023","snippet":"本文将深入探讨四款热门数据分析工具：Tableau、PowerBI、Google Data Studio和FineBI的优缺点，为您提供全面的比较和对比。无论您是个人用户还是企业团队， ...","snippet_highlighted_words":["分析工具"],"source":"FineBI"},{"position":8,"title":"BI数据分析工具有哪些？最佳选择及使用指南","link":"https://www.guandata.com/gy/post/158.html","redirect_link":"https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://www.guandata.com/gy/post/158.html&ved=2ahUKEwicpJyVlZCMAxWGRkEAHfKMD1EQFnoECCsQAQ","displayed_link":"https://www.guandata.com › post","favicon":"https://serpapi.com/searches/67d795de0fb229fe616483ec/images/ba7f274fcd3ab370bb901f321bd74011a22a275e09f7b5a6e4c57743e667e4e6.png","date":"Oct 18, 2024","snippet":"需求：首先要明确自己的分析需求，包括数据源、数据类型、数据量以及分析目标。 功能：了解不同工具的功能特点，判断其是否满足你的分析需求。","source":"观远BI"},{"position":9,"title":"适合数据分析师的10 个最佳AI 工具（2025 年XNUMX 月）","link":"https://www.unite.ai/zh-CN/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD%E5%B7%A5%E5%85%B7%E6%95%B0%E6%8D%AE%E5%88%86%E6%9E%90%E5%B8%88/","redirect_link":"https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://www.unite.ai/zh-CN/%25E4%25BA%25BA%25E5%25B7%25A5%25E6%2599%25BA%25E8%2583%25BD%25E5%25B7%25A5%25E5%2585%25B7%25E6%2595%25B0%25E6%258D%25AE%25E5%2588%2586%25E6%259E%2590%25E5%25B8%2588/&ved=2ahUKEwicpJyVlZCMAxWGRkEAHfKMD1EQFnoECCwQAQ","displayed_link":"https://www.unite.ai › zh-CN › 人...","favicon":"https://serpapi.com/searches/67d795de0fb229fe616483ec/images/ba7f274fcd3ab370bb901f321bd7401149bab3986d916bf21b2818f527d13926.png","date":"Mar 1, 2025","snippet":"Akkio 是我们为数据分析师列出的5 个最佳人工智能工具列表中的最后一个，它是一种业务分析和预测工具，可供用户分析数据并预测潜在结果。 该工具面向初学者， ...","snippet_highlighted_words":["分析","工具","分析","工具","分析","工具"],"source":"Unite.AI"},{"position":10,"title":"如何选择数据分析工具？参考以下五点","link":"https://www.cnblogs.com/mingyueshuoshuju/p/13880058.html","redirect_link":"https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://www.cnblogs.com/mingyueshuoshuju/p/13880058.html&ved=2ahUKEwicpJyVlZCMAxWGRkEAHfKMD1EQFnoECC0QAQ","displayed_link":"https://www.cnblogs.com › mingy...","favicon":"https://serpapi.com/searches/67d795de0fb229fe616483ec/images/ba7f274fcd3ab370bb901f321bd7401107702b4f18bdb4166448ff651642fc30.png","date":"Oct 26, 2020","snippet":"操作简单，功能丰富，适合业务人员操作。 (5)性价比和维护成本. 大多数工具(特别是企业级数据分析工具)在使用之前都需要花费一些费用。所以在选择数据分析 ...","snippet_highlighted_words":["适合","工具","分析工具","选择","分析"],"source":"博客园"}],"pagination":{"current":1,"next":"https://www.google.com/search?q=%E5%A6%82%E4%BD%95%E9%80%89%E6%8B%A9%E9%80%82%E5%90%88%E7%9A%84%E5%88%86%E6%9E%90%E5%B7%A5%E5%85%B7%EF%BC%9F&sca_esv=22ea0ad1f1a98e14&ei=35XXZ9y4NIaNhbIP8pm-iAU&start=10&sa=N&sstk=Af40H4Vq22pA_UqFdnTF12UJBexz0avjb4J5V83hddojrL5ilbGpvW7uvn0iwOBYYFZC-fW1fDbBSUAO4UVpey5gZRK2uOpOTKYbhw&ved=2ahUKEwicpJyVlZCMAxWGRkEAHfKMD1EQ8NMDegQICRAW","other_pages":{"2":"https://www.google.com/search?q=%E5%A6%82%E4%BD%95%E9%80%89%E6%8B%A9%E9%80%82%E5%90%88%E7%9A%84%E5%88%86%E6%9E%90%E5%B7%A5%E5%85%B7%EF%BC%9F&sca_esv=22ea0ad1f1a98e14&ei=35XXZ9y4NIaNhbIP8pm-iAU&start=10&sa=N&sstk=Af40H4Vq22pA_UqFdnTF12UJBexz0avjb4J5V83hddojrL5ilbGpvW7uvn0iwOBYYFZC-fW1fDbBSUAO4UVpey5gZRK2uOpOTKYbhw&ved=2ahUKEwicpJyVlZCMAxWGRkEAHfKMD1EQ8tMDegQICRAE","3":"https://www.google.com/search?q=%E5%A6%82%E4%BD%95%E9%80%89%E6%8B%A9%E9%80%82%E5%90%88%E7%9A%84%E5%88%86%E6%9E%90%E5%B7%A5%E5%85%B7%EF%BC%9F&sca_esv=22ea0ad1f1a98e14&ei=35XXZ9y4NIaNhbIP8pm-iAU&start=20&sa=N&sstk=Af40H4Vq22pA_UqFdnTF12UJBexz0avjb4J5V83hddojrL5ilbGpvW7uvn0iwOBYYFZC-fW1fDbBSUAO4UVpey5gZRK2uOpOTKYbhw&ved=2ahUKEwicpJyVlZCMAxWGRkEAHfKMD1EQ8tMDegQICRAG","4":"https://www.google.com/search?q=%E5%A6%82%E4%BD%95%E9%80%89%E6%8B%A9%E9%80%82%E5%90%88%E7%9A%84%E5%88%86%E6%9E%90%E5%B7%A5%E5%85%B7%EF%BC%9F&sca_esv=22ea0ad1f1a98e14&ei=35XXZ9y4NIaNhbIP8pm-iAU&start=30&sa=N&sstk=Af40H4Vq22pA_UqFdnTF12UJBexz0avjb4J5V83hddojrL5ilbGpvW7uvn0iwOBYYFZC-fW1fDbBSUAO4UVpey5gZRK2uOpOTKYbhw&ved=2ahUKEwicpJyVlZCMAxWGRkEAHfKMD1EQ8tMDegQICRAI","5":"https://www.google.com/search?q=%E5%A6%82%E4%BD%95%E9%80%89%E6%8B%A9%E9%80%82%E5%90%88%E7%9A%84%E5%88%86%E6%9E%90%E5%B7%A5%E5%85%B7%EF%BC%9F&sca_esv=22ea0ad1f1a98e14&ei=35XXZ9y4NIaNhbIP8pm-iAU&start=40&sa=N&sstk=Af40H4Vq22pA_UqFdnTF12UJBexz0avjb4J5V83hddojrL5ilbGpvW7uvn0iwOBYYFZC-fW1fDbBSUAO4UVpey5gZRK2uOpOTKYbhw&ved=2ahUKEwicpJyVlZCMAxWGRkEAHfKMD1EQ8tMDegQICRAK","6":"https://www.google.com/search?q=%E5%A6%82%E4%BD%95%E9%80%89%E6%8B%A9%E9%80%82%E5%90%88%E7%9A%84%E5%88%86%E6%9E%90%E5%B7%A5%E5%85%B7%EF%BC%9F&sca_esv=22ea0ad1f1a98e14&ei=35XXZ9y4NIaNhbIP8pm-iAU&start=50&sa=N&sstk=Af40H4Vq22pA_UqFdnTF12UJBexz0avjb4J5V83hddojrL5ilbGpvW7uvn0iwOBYYFZC-fW1fDbBSUAO4UVpey5gZRK2uOpOTKYbhw&ved=2ahUKEwicpJyVlZCMAxWGRkEAHfKMD1EQ8tMDegQICRAM","7":"https://www.google.com/search?q=%E5%A6%82%E4%BD%95%E9%80%89%E6%8B%A9%E9%80%82%E5%90%88%E7%9A%84%E5%88%86%E6%9E%90%E5%B7%A5%E5%85%B7%EF%BC%9F&sca_esv=22ea0ad1f1a98e14&ei=35XXZ9y4NIaNhbIP8pm-iAU&start=60&sa=N&sstk=Af40H4Vq22pA_UqFdnTF12UJBexz0avjb4J5V83hddojrL5ilbGpvW7uvn0iwOBYYFZC-fW1fDbBSUAO4UVpey5gZRK2uOpOTKYbhw&ved=2ahUKEwicpJyVlZCMAxWGRkEAHfKMD1EQ8tMDegQICRAO","8":"https://www.google.com/search?q=%E5%A6%82%E4%BD%95%E9%80%89%E6%8B%A9%E9%80%82%E5%90%88%E7%9A%84%E5%88%86%E6%9E%90%E5%B7%A5%E5%85%B7%EF%BC%9F&sca_esv=22ea0ad1f1a98e14&ei=35XXZ9y4NIaNhbIP8pm-iAU&start=70&sa=N&sstk=Af40H4Vq22pA_UqFdnTF12UJBexz0avjb4J5V83hddojrL5ilbGpvW7uvn0iwOBYYFZC-fW1fDbBSUAO4UVpey5gZRK2uOpOTKYbhw&ved=2ahUKEwicpJyVlZCMAxWGRkEAHfKMD1EQ8tMDegQICRAQ","9":"https://www.google.com/search?q=%E5%A6%82%E4%BD%95%E9%80%89%E6%8B%A9%E9%80%82%E5%90%88%E7%9A%84%E5%88%86%E6%9E%90%E5%B7%A5%E5%85%B7%EF%BC%9F&sca_esv=22ea0ad1f1a98e14&ei=35XXZ9y4NIaNhbIP8pm-iAU&start=80&sa=N&sstk=Af40H4Vq22pA_UqFdnTF12UJBexz0avjb4J5V83hddojrL5ilbGpvW7uvn0iwOBYYFZC-fW1fDbBSUAO4UVpey5gZRK2uOpOTKYbhw&ved=2ahUKEwicpJyVlZCMAxWGRkEAHfKMD1EQ8tMDegQICRAS","10":"https://www.google.com/search?q=%E5%A6%82%E4%BD%95%E9%80%89%E6%8B%A9%E9%80%82%E5%90%88%E7%9A%84%E5%88%86%E6%9E%90%E5%B7%A5%E5%85%B7%EF%BC%9F&sca_esv=22ea0ad1f1a98e14&ei=35XXZ9y4NIaNhbIP8pm-iAU&start=90&sa=N&sstk=Af40H4Vq22pA_UqFdnTF12UJBexz0avjb4J5V83hddojrL5ilbGpvW7uvn0iwOBYYFZC-fW1fDbBSUAO4UVpey5gZRK2uOpOTKYbhw&ved=2ahUKEwicpJyVlZCMAxWGRkEAHfKMD1EQ8tMDegQICRAU"}},"serpapi_pagination":{"current":1,"next_link":"https://serpapi.com/search.json?device=desktop&engine=google&google_domain=google.com&q=%E5%A6%82%E4%BD%95%E9%80%89%E6%8B%A9%E9%80%82%E5%90%88%E7%9A%84%E5%88%86%E6%9E%90%E5%B7%A5%E5%85%B7%EF%BC%9F&start=10","next":"https://serpapi.com/search.json?device=desktop&engine=google&google_domain=google.com&q=%E5%A6%82%E4%BD%95%E9%80%89%E6%8B%A9%E9%80%82%E5%90%88%E7%9A%84%E5%88%86%E6%9E%90%E5%B7%A5%E5%85%B7%EF%BC%9F&start=10","other_pages":{"2":"https://serpapi.com/search.json?device=desktop&engine=google&google_domain=google.com&q=%E5%A6%82%E4%BD%95%E9%80%89%E6%8B%A9%E9%80%82%E5%90%88%E7%9A%84%E5%88%86%E6%9E%90%E5%B7%A5%E5%85%B7%EF%BC%9F&start=10","3":"https://serpapi.com/search.json?device=desktop&engine=google&google_domain=google.com&q=%E5%A6%82%E4%BD%95%E9%80%89%E6%8B%A9%E9%80%82%E5%90%88%E7%9A%84%E5%88%86%E6%9E%90%E5%B7%A5%E5%85%B7%EF%BC%9F&start=20","4":"https://serpapi.com/search.json?device=desktop&engine=google&google_domain=google.com&q=%E5%A6%82%E4%BD%95%E9%80%89%E6%8B%A9%E9%80%82%E5%90%88%E7%9A%84%E5%88%86%E6%9E%90%E5%B7%A5%E5%85%B7%EF%BC%9F&start=30","5":"https://serpapi.com/search.json?device=desktop&engine=google&google_domain=google.com&q=%E5%A6%82%E4%BD%95%E9%80%89%E6%8B%A9%E9%80%82%E5%90%88%E7%9A%84%E5%88%86%E6%9E%90%E5%B7%A5%E5%85%B7%EF%BC%9F&start=40","6":"https://serpapi.com/search.json?device=desktop&engine=google&google_domain=google.com&q=%E5%A6%82%E4%BD%95%E9%80%89%E6%8B%A9%E9%80%82%E5%90%88%E7%9A%84%E5%88%86%E6%9E%90%E5%B7%A5%E5%85%B7%EF%BC%9F&start=50","7":"https://serpapi.com/search.json?device=desktop&engine=google&google_domain=google.com&q=%E5%A6%82%E4%BD%95%E9%80%89%E6%8B%A9%E9%80%82%E5%90%88%E7%9A%84%E5%88%86%E6%9E%90%E5%B7%A5%E5%85%B7%EF%BC%9F&start=60","8":"https://serpapi.com/search.json?device=desktop&engine=google&google_domain=google.com&q=%E5%A6%82%E4%BD%95%E9%80%89%E6%8B%A9%E9%80%82%E5%90%88%E7%9A%84%E5%88%86%E6%9E%90%E5%B7%A5%E5%85%B7%EF%BC%9F&start=70","9":"https://serpapi.com/search.json?device=desktop&engine=google&google_domain=google.com&q=%E5%A6%82%E4%BD%95%E9%80%89%E6%8B%A9%E9%80%82%E5%90%88%E7%9A%84%E5%88%86%E6%9E%90%E5%B7%A5%E5%85%B7%EF%BC%9F&start=80","10":"https://serpapi.com/search.json?device=desktop&engine=google&google_domain=google.com&q=%E5%A6%82%E4%BD%95%E9%80%89%E6%8B%A9%E9%80%82%E5%90%88%E7%9A%84%E5%88%86%E6%9E%90%E5%B7%A5%E5%85%B7%EF%BC%9F&start=90"}}},"content":"选择适合的分析工具时，可以考虑以下几个关键因素：\\n\\n## 1. 功能和特点\\n\\n首先，要明确分析工具的基本功能和特点，确保它们能够满足你的需求。例如，某些工具可能擅长处理特定类型的数据（如数字数据、文本数据等），而其他工具则可能在数据可视化、统计分析等方面更为强大。根据你的分析目的，选择相应的工具非常重要[6][7]。\\n\\n## 2. 成本和许可证\\n\\n考虑工具的费用结构，包括购买成本、维护成本和其他潜在费用。很多企业级数据分析工具需要支付高昂的许可证费用，而对于小型企业或个人用户，性价比高的免费工具也是不错的选择[3][4]。\\n\\n## 3. 易用性和学习曲线\\n\\n某些分析工具的学习曲线较陡峭，可能需要更多的培训和学习时间。因此，如果团队的成员对数据分析的经验较少，选择一个界面友好、易于上手的工具将更为适宜。例如，Excel和Tableau是初学者的常见选择，其操作相对直观[9][10]。\\n\\n## 4. 数据隐私和安全性\\n\\n随着数据隐私法规的逐渐严格，确保所选工具能够有效保护数据隐私和安全也是必不可少的。这一点对于企业尤为重要，在选择工具时应仔细审查其安全特性和符合的法规标准[5].\\n\\n## 5. 社区和支持\\n\\n良好的社区支持和技术支持能够帮助用户在遇到问题时获得及时的解决方案。查看工具的用户社区活跃程度、官方文档和版本更新频率，都能反映出工具的稳定性和活跃程度[8]。\\n\\n结合以上因素，用户可以更好地选择出适合其特定需求的数据分析工具。这一过程不仅仅是挑选工具，更是要考虑工具如何与实际工作流程相结合以提升效率和效果。","summarizeData":{"content":"选择分析工具时要考虑功能和特点、成本、易用性、数据隐私及社区支持。确保工具满足需求且具性价比，易于学习和使用，同时保护数据安全，能提供良好的技术支持。","author":{"name":"By AIGNE","age":30}},"summarizeImage":[{"url":"https://bbqawfllzdt3pahkdsrsone6p3wpxcwp62vlabtawfu.did.abtnet.io/image-bin/uploads/9bb95f3743b2b9ecf77a70aa50db0101.png"}]} `,
  instruction: `
  获取页面展示需要的信息，遵从下面的规则
  - 忽略 sectionsData 之外的字段，只处理 sectionsData\n            
  `,
};

// Test data 2: Complex nested structure
export const testData2 = {
  responseSchema: `{
    "type": "object",
    "properties": {
      "product": {
        "type": "object",
        "properties": {
          "basicInfo": {
            "type": "object",
            "properties": {
              "name": { "type": "string" },
              "price": { "type": "number" },
              "description": { "type": "string" }
            }
          },
          "specifications": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "name": { "type": "string" },
                "value": { "type": "string" },
                "unit": { "type": "string" }
              }
            }
          },
          "reviews": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "user": {
                  "type": "object",
                  "properties": {
                    "name": { "type": "string" },
                    "level": { "type": "number" }
                  }
                },
                "content": { "type": "string" },
                "rating": { "type": "number" },
                "images": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "url": { "type": "string" },
                      "type": { "type": "string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }`,
  sourceSchema: `{"type":"object","properties":{"rawProduct":{"type":"object","properties":{"info":{"type":"object","properties":{"productName":{"type":"string"},"price":{"type":"number"},"desc":{"type":"string"}}},"specs":{"type":"array","items":{"type":"object","properties":{"specName":{"type":"string"},"specValue":{"type":"string"},"specUnit":{"type":"string"}}}},"userReviews":{"type":"array","items":{"type":"object","properties":{"reviewer":{"type":"object","properties":{"userName":{"type":"string"},"userLevel":{"type":"number"}}},"reviewText":{"type":"string"},"score":{"type":"number"},"reviewImages":{"type":"array","items":{"type":"object","properties":{"imageUrl":{"type":"string"},"imageType":{"type":"string"}}}}}}}}}}}`,
  sourceData: `{
    "rawProduct": {
      "info": {
        "productName": "iPhone 15 Pro",
        "price": 999.99,
        "desc": "最新款苹果手机，搭载A17芯片"
      },
      "specs": [
        {
          "specName": "屏幕",
          "specValue": "6.7",
          "specUnit": "英寸"
        },
        {
          "specName": "内存",
          "specValue": "256",
          "specUnit": "GB"
        }
      ],
      "userReviews": [
        {
          "reviewer": {
            "userName": "张三",
            "userLevel": 5
          },
          "reviewText": "非常好用的手机，拍照效果很棒",
          "score": 5,
          "reviewImages": [
            {
              "imageUrl": "https://example.com/photo1.jpg",
              "imageType": "product"
            }
          ]
        }
      ]
    }
  }`,
  instruction: `
  将原始产品数据转换为标准格式，注意以下规则：
  - 字段名称需要标准化，如 productName -> name
  - 保持数据结构的一致性，包括嵌套对象和数组
  - 确保所有必需字段都被正确映射
  `,
};

// Test data 3: Array processing and conditional mapping
export const testData3 = {
  responseSchema: `{
    "type": "object",
    "properties": {
      "order": {
        "type": "object",
        "properties": {
          "orderId": { "type": "string" },
          "status": { "type": "string" },
          "items": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "productId": { "type": "string" },
                "quantity": { "type": "number" },
                "price": { "type": "number" },
                "discount": { "type": "number" }
              }
            }
          },
          "shipping": {
            "type": "object",
            "properties": {
              "address": { "type": "string" },
              "method": { "type": "string" },
              "cost": { "type": "number" }
            }
          },
          "payment": {
            "type": "object",
            "properties": {
              "method": { "type": "string" },
              "status": { "type": "string" },
              "amount": { "type": "number" }
            }
          }
        }
      }
    }
  }`,
  sourceSchema: `{"type":"object","properties":{"orderData":{"type":"object","properties":{"id":{"type":"string"},"orderStatus":{"type":"string"},"products":{"type":"array","items":{"type":"object","properties":{"id":{"type":"string"},"qty":{"type":"number"},"unitPrice":{"type":"number"},"discountRate":{"type":"number"}}}},"delivery":{"type":"object","properties":{"shippingAddress":{"type":"string"},"shippingMethod":{"type":"string"},"shippingFee":{"type":"number"}}},"paymentInfo":{"type":"object","properties":{"paymentMethod":{"type":"string"},"paymentStatus":{"type":"string"},"totalAmount":{"type":"number"}}}}}}}`,
  sourceData: `{
    "orderData": {
      "id": "ORD-2024-001",
      "orderStatus": "processing",
      "products": [
        {
          "id": "P001",
          "qty": 2,
          "unitPrice": 100,
          "discountRate": 0.1
        },
        {
          "id": "P002",
          "qty": 1,
          "unitPrice": 200,
          "discountRate": 0
        }
      ],
      "delivery": {
        "shippingAddress": "北京市朝阳区xxx街道",
        "shippingMethod": "express",
        "shippingFee": 20
      },
      "paymentInfo": {
        "paymentMethod": "alipay",
        "paymentStatus": "paid",
        "totalAmount": 320
      }
    }
  }`,
  instruction: `
  将订单数据转换为标准格式，注意以下规则：
  - 字段名称需要标准化，如 orderStatus -> status
  - 数组中的对象字段也需要标准化
  - 保持数值类型的一致性
  - 确保所有必需字段都被正确映射
  `,
};

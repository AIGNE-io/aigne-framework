custom-component-list:
  - id: bKJH63vdZlE8pQrX
    name: Discuss Kit Blog List
    description: 显示博客列表的组件，只需要配置标题、描述，组件内会显示博客列表
    properties:
      - id: gs1rn5jmxfvpxptx
        key: title
        type: string
        description: 组件标题，默认值：最新博客
      - id: 9ajrz12ik7esfk1z
        key: description
        type: string
        description: 组件描述
  - id: 5TKT1CQ0V8GYltq2
    name: Hero Block
    description: 英雄块组件, 展示标题、描述，和图片
    properties:
      - id: gs1rn5jmxfvpxptx
        key: title
        type: json
        description: "Hero 区域的标题"
        subProperties:
          text:
            id: jpnzxm4544511frv
            key: text
            type: string
            description: ""
      - id: 5iKS0KmFAoxaza-x
        key: rightContent
        type: url
        description: "Hero 区域的右侧内容, 可以配置图片 url"
      - id: 5b24apv8ophnq7ob
        key: simlpleDescription
        type: json
        description: "Hero 区域的描述"
        subProperties:
          text:
            id: vwgcygnovm1rtrgj
            key: text
            type: string
            description: ""
      - id: 9ajrz12ik7esfk1z
        key: description
        type: array
        description: 按钮列表
        subProperties:
          type:
            key: type
            type: string
            description: 固定值： link
          text:
            key: text
            type: string
            description: 按钮文本
          url:
            key: url
            type: string
            description: 按钮链接
          color:
            key: color
            type: string
            description: 按钮颜色，支持：primary、secondary
          size:
            key: size
            type: string
            description: 按钮大小，支持：small、medium、large
          variant:
            key: variant
            type: string
            description: 按钮样式，支持：contained、outlined、text
  - id: 5HwMAd73anM8MwXH
    name: Content Cards Block
    description: |
      这是一个可配置的卡片列表组件，支持名暗两种主题，四种布局，而且卡片列表是可选的，可以通过灵活的配置来满足不同的需求。
      - 可以只配置标题、描述、按钮，不配置卡片列表，显示为 CTA 组件
      - 在一个页面中可重复使用，通过切换主题和布局，避免样式重复
    properties:
      - id: gs1rn5jmxfvpxptx
        key: title
        type: string
        description: 标题
      - id: 9ajrz12ik7esfk1z
        key: description
        type: string
        description: 描述
      - id: 600vmg720dw3eyfw
        key: buttons
        type: array
        description: 按钮列表
        subProperties:
          text:
            id: cn4l9npvll2belst
            key: text
            type: string
            description: 按钮文本
          url:
            id: mem6l9avy106222r
            key: url
            type: string
            description: 按钮链接
          variant:
            id: gdeaomdlnyzbxwr9
            key: variant
            type: string
            description: 按钮样式，支持：primary、secondary
          startIcon:
            id: njxc0aeoifmwnxat
            key: startIcon
            type: url
            description: 按钮前置图标
          openNewTab:
            id: mwdv90ftwid8fn51
            key: openNewTab
            type: boolean
            description: 是否新开标签页
      - id: tquwqv8t7svabmwk
        key: cards
        type: array
        description: 卡片列表
        subProperties:
          title:
            id: njy3bhsanotnfnbo
            key: title
            type: string
            description: 卡片标题
          description:
            id: 4yqdty1cj2b6j0cf
            key: description
            type: string
            description: 卡片描述
          image:
            id: 26hj5g5d4u41seof
            key: image
            type: url
            description: 图片
          link:
            id: 8jgzcaxmj7ja3kho
            key: link
            type: string
            description: 链接
      - id: n44a1rovulmx6nee
        key: layoutType
        type: string
        description: 布局类型，支持："grid" | "horizontal" | "feature" | "compact"
      - id: 0hyqs3rin5nq97ab
        key: theme
        type: string
        description: 主题, 支持："light" | "dark"
  - id: f3k9m2p5x8w7n4v6
    name: Feature Detail Block
    component: feature-detail-block
    description: 功能详情组件, 展示标题、描述列表，和图片
    properties:
      - id: gs1rn5jmxfvpxptx
        key: tagline
        type: json
        description: ""
        subProperties:
          text:
            id: 6ievaxj7acz1bey3
            key: text
            type: string
            description: ""
      - id: 9ajrz12ik7esfk1z
        key: heading
        type: json
        description: ""
        subProperties:
          text:
            id: 6dyg20uu49fruifs
            key: text
            type: string
            description: ""
      - id: 3ckcfvf6b7zyskk8
        key: description
        type: json
        description: ""
        subProperties:
          text:
            id: v7v6hfc4vflxidng
            key: text
            type: string
            description: ""
      - id: x3lqht8ikble1itx
        key: features
        type: array
        description: ""
        subProperties:
          heading:
            id: c5whnccwzqqzaa0w
            key: heading
            type: json
            description: ""
            subProperties:
              text:
                id: guy7r6lrz9alh8jy
                key: text
                type: string
                description: ""
          description:
            id: d7xkpq2mzrn3vb9s
            key: description
            type: json
            description: ""
            subProperties:
              text:
                id: ut6l9l8t0na2zb1h
                key: text
                type: string
                description: ""
  - id: a1b2c3d4e5f6g7h8
    name: CTA Block
    component: cta-block
    description: 行动号召组件，展示标题、描述，和行动的按钮
    properties:
      - id: h2k4l6m8n0p2q4r6
        key: heading
        type: json
        description: ""
        subProperties:
          text:
            id: text
            key: text
            type: string
            description: ""
      - id: s5t7u9v1w3x5y7z9
        key: description
        type: json
        description: ""
        subProperties:
          text:
            id: text
            key: text
            type: string
            description: ""
      - id: b1d3f5h7j9l1n3p5
        key: buttons
        type: array
        description: ""
        subProperties:
          text:
            id: r7t9v1x3z5b7d9f1
            key: text
            type: string
            description: ""
          link:
            id: h3j5l7n9p1r3t5v7
            key: link
            type: string
            description: ""
  - id: ZaGmarrkQs310Azn
    name: FAQ Block
    component: faq-block
    description: 常见问题组件, 展示常见问题列表，和答案
    properties:
      - id: gs1rn5jmxfvpxptx
        key: title
        type: json
        description: ""
        subProperties:
          text:
            id: x3kzu4wqf4xcirgh
            key: text
            type: string
            description: ""
      - id: 9ajrz12ik7esfk1z
        key: description
        type: json
        description: ""
        subProperties:
          text:
            id: ks2kfwq664bbfrv0
            key: text
            type: string
            description: ""
      - id: 4221qi1bxy322mf4
        key: faqs
        type: array
        description: ""
        subProperties:
          title:
            id: 2aomv8m3rho8kdo8
            key: title
            type: string
            description: ""
          answer:
            id: v65kure0krm7e6q3
            key: answer
            type: string
            description: ""






<template>
    <div>
      <!-- 使用 Graph 组件 -->
      <Graph />
    </div>
    <!-- <iframe src="/KGUI/index.html" width="100%" height="100%" scrolling="no"></iframe> -->
  </template>
  
  <script>
  // 引入 Graph 组件
  import Graph from '@/components/Graph/index.vue';
  
  export default {
    name: 'GraphView',
    components: {
      // 注册 Graph 组件
      Graph
    }
  };
  </script>
  
  <style>
  /* 这里可以添加 Graph 组件相关的样式 */
  </style>
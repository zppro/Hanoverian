<template lang="pug">
    #app
        .top-bar
        header.header
            .logo-c
                img.logo(src="~/public/logo-48.png" alt="logo")
            .city-c
            nav.channel
                router-link(to="/tpa") 养老机构
                router-link(to="/tnm") 照护人员
                router-link(to="/job") 招聘信息
</template>

<style lang="stylus">
    body
        font-size 15px
        background-color lighten(#eceef1, 30%)
        margin 0
        padding-top 100px
        color #34495e
        overflow-y scroll
    a
        color #34495e
        text-decoration none
    .top-bar
        background-color #f1f1f1
        position fixed
        z-index 999
        height 70px
        top 0
        left 0
        right 0
    .header
        background-color #ff6600
        position fixed
        z-index 999
        height 70px
        top 30
        left 0
        right 0
        display flex
        justify-content space-between
        .logo-c
            width 140px
            height 70px
        .city-c
            width 100px
            height 70px
        .channel
            flex 1
</style>
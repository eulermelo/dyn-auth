# Módulo de autenticação Dynamix (Unimed Brasil / SSO)

Módulo que gerencia a autenticação do usuário. Guarda o token enviado pelo servidor no primeiro
acesso autenticado, recupera o usuário e suas permissões de acesso. Também possui facilitadores
de acesso as permissões do usuário, logout e diretivas de controle de acesso.

Outro ponto fundamental é a interceptação das requisições HTTP para inclusão do token de acesso
no header da requisição.

## Serviços

- dynAuth
    Serviço para recuperar informações do usuário e suas permissões, logout e outros.

## Diretivas

- dynAccessControl
    - Diretiva para controle de acesso de acordo com as informações do usuário logado.

## Configuração

Para realizar a configuração do módulo, é necessário injetar 'dynAuthConfigProvider'
e através da propriedade 'config' setar as configurações necessárias, sendo elas:

- homeLocation
- loginUrl
- logoutUrl
- userInfoUrl

Ex.:

    function funcaoDeConfiguracao(dynAuthConfigProvider) {
        dynAuthConfigProvider.config.homeLocation = '/home';
        dynAuthConfigProvider.config.loginUrl = '/logar';
    }

## Eventos

- dynAuth.userChanged
    Lançado quando o usuário foi alterado e completamente carregado
- dynAuth.userLoggedOut
    Lançado logo após o logout do usuário
- dynAuth.userUnauthorized
    Lançado quando não há login valido ativo e não existe token na requisição
- dynAuth.userLoadInfoFailed
    Lançado quando existe token na requisição mas não foi possível carregar as informações do usuário.
- dynAuth.forbbiden
    Quando uma ação é requerida e o usuário não possui permissão, esse evento é lançado
- dynAuth.internalServerError
    Lançado quando ocorre algum erro por parte do servidor

## Demo

```js
dynAuth.hasValidCredentials()
    .then(function(response) {
        return dynAuth.loadUserInfos();
    })
    .then(function(response) {
        // Usuário está autenticado e com seus dados carregados.
    })
    .catch(function(response) {
        // Avisa o usuário que sua session está expirada.
    });
```

## Deploy
bower register dyn-auth {{repositorio git}}

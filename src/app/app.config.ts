import { ApplicationConfig, provideZoneChangeDetection, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { ApolloClientOptions, InMemoryCache, ApolloLink } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { setContext } from '@apollo/client/link/context';
import { Apollo, APOLLO_OPTIONS } from 'apollo-angular';

const uri = 'https://one01410993-assignment2-comp3133-backend.onrender.com/graphql'; 

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(),
        {
            provide: APOLLO_OPTIONS,
            useFactory: () => {
                const httpLink = new HttpLink(inject(HttpClient)).create({ uri });

                const authLink = setContext((_, { headers }) => {
                    const token = localStorage.getItem('authToken');
                    return {
                        headers: {
                            ...headers,
                            Authorization: token ? `${token}` : '',
                        },
                    };
                });

                return {
                    cache: new InMemoryCache(),
                    link: ApolloLink.from([authLink, httpLink]),
                };
            },
            deps: [], 
        },
        Apollo,
    ],
};
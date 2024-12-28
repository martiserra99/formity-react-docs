import type {
  Schema,
  Cond,
  Loop,
  Form,
  Return,
  Variables,
} from "@formity/react";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  FormView,
  FormLayout,
  Row,
  TextField,
  NumberField,
  MultiSelect,
  Listbox,
  Select,
  YesNo,
  Next,
  Back,
} from "./components";

export type Values = [
  Form<{ name: string; surname: string; age: number }>,
  Form<{ softwareDeveloper: boolean }>,
  Cond<{
    then: [
      Variables<{
        languagesOptions: { value: string; label: string }[];
        questions: Record<string, string>;
      }>,
      Form<{ languages: string[] }>,
      Variables<{
        i: number;
        languagesRatings: { name: string; rating: string }[];
      }>,
      Loop<
        [
          Variables<{ language: string }>,
          Variables<{ question: string }>,
          Form<{ rating: string }>,
          Variables<{
            i: number;
            languagesRatings: { name: string; rating: string }[];
          }>
        ]
      >,
      Return<{
        fullName: string;
        age: number;
        softwareDeveloper: boolean;
        languages: { name: string; rating: string }[];
      }>
    ];
    else: [
      Form<{ interested: string }>,
      Return<{
        fullName: string;
        age: number;
        softwareDeveloper: boolean;
        interested: string;
      }>
    ];
  }>
];

export const schema: Schema<Values> = [
  {
    form: {
      values: () => ({
        name: ["", []],
        surname: ["", []],
        age: [20, []],
      }),
      render: ({ values, onNext }) => (
        <FormView
          key="name"
          defaultValues={values}
          resolver={zodResolver(
            z.object({
              name: z
                .string()
                .min(1, { message: "Required" })
                .max(20, { message: "Must be at most 20 characters" }),
              surname: z
                .string()
                .min(1, { message: "Required" })
                .max(20, { message: "Must be at most 20 characters" }),
              age: z
                .number()
                .min(18, { message: "Minimum of 18 years old" })
                .max(99, { message: "Maximum of 99 years old" }),
            })
          )}
          onNext={onNext}
        >
          <FormLayout
            heading="Tell us about yourself"
            description="We would want to know a little bit more about you"
            fields={[
              <Row
                key="name-surname"
                items={[
                  <TextField key="name" name="name" label="Name" />,
                  <TextField key="surname" name="surname" label="Surname" />,
                ]}
              />,
              <NumberField key="age" name="age" label="Age" />,
            ]}
            button={<Next>Next</Next>}
          />
        </FormView>
      ),
    },
  },
  {
    form: {
      values: () => ({
        softwareDeveloper: [true, []],
      }),
      render: ({ values, onNext, onBack }) => (
        <FormView
          key="softwareDeveloper"
          defaultValues={values}
          resolver={zodResolver(
            z.object({
              softwareDeveloper: z.boolean(),
            })
          )}
          onNext={onNext}
        >
          <FormLayout
            heading="Are you a software developer?"
            description="We would like to know if you are a software developer"
            fields={[
              <YesNo
                key="softwareDeveloper"
                name="softwareDeveloper"
                label="Software Developer"
              />,
            ]}
            button={<Next>Next</Next>}
            back={<Back onBack={onBack} />}
          />
        </FormView>
      ),
    },
  },
  {
    cond: {
      if: ({ softwareDeveloper }) => softwareDeveloper,
      then: [
        {
          variables: () => ({
            languagesOptions: [
              { value: "javascript", label: "JavaScript" },
              { value: "python", label: "Python" },
              { value: "go", label: "Go" },
            ],
            questions: {
              javascript: "What rating would you give to JavaScript?",
              python: "What rating would you give to Python?",
              go: "What rating would you give to Go?",
            },
          }),
        },
        {
          form: {
            values: () => ({
              languages: [[], []],
            }),
            render: ({ inputs, values, onNext, onBack }) => (
              <FormView
                key="languages"
                defaultValues={values}
                resolver={zodResolver(
                  z.object({
                    languages: z.array(z.string()),
                  })
                )}
                onNext={onNext}
              >
                <FormLayout
                  heading="What are your favourite programming languages?"
                  description="We would like to know which of the following programming languages you like the most"
                  fields={[
                    <MultiSelect
                      key="languages"
                      name="languages"
                      label="Languages"
                      options={inputs.languagesOptions}
                      direction="y"
                    />,
                  ]}
                  button={<Next>Next</Next>}
                  back={<Back onBack={onBack} />}
                />
              </FormView>
            ),
          },
        },
        {
          variables: () => ({
            i: 0,
            languagesRatings: [],
          }),
        },
        {
          loop: {
            while: ({ i, languages }) => i < languages.length,
            do: [
              {
                variables: ({ i, languages }) => ({
                  language: languages[i],
                }),
              },
              {
                variables: ({ questions, language }) => ({
                  question: questions[language],
                }),
              },
              {
                form: {
                  values: ({ language }) => ({
                    rating: ["love-it", [language]],
                  }),
                  render: ({ inputs, values, onNext, onBack }) => (
                    <FormView
                      key={`rating-${inputs.language}`}
                      defaultValues={values}
                      resolver={zodResolver(
                        z.object({
                          rating: z.string(),
                        })
                      )}
                      onNext={onNext}
                    >
                      <FormLayout
                        heading={inputs.question}
                        description="Since you said it is one of your favourite languages, we would like to know how much you like it"
                        fields={[
                          <Select
                            key="rating"
                            name="rating"
                            label="Rating"
                            options={[
                              {
                                value: "love-it",
                                label: "Love it",
                              },
                              {
                                value: "like-it-a-lot",
                                label: "Like it a lot",
                              },
                              {
                                value: "it-is-okay",
                                label: "It's okay",
                              },
                            ]}
                            direction="y"
                          />,
                        ]}
                        button={<Next>Next</Next>}
                        back={<Back onBack={onBack} />}
                      />
                    </FormView>
                  ),
                },
              },
              {
                variables: ({ i, languagesRatings, language, rating }) => ({
                  i: i + 1,
                  languagesRatings: [
                    ...languagesRatings,
                    { name: language, rating },
                  ],
                }),
              },
            ],
          },
        },
        {
          return: ({
            name,
            surname,
            age,
            softwareDeveloper,
            languagesRatings,
          }) => ({
            fullName: `${name} ${surname}`,
            age,
            softwareDeveloper,
            languages: languagesRatings,
          }),
        },
      ],
      else: [
        {
          form: {
            values: () => ({
              interested: ["maybe", []],
            }),
            render: ({ values, onNext, onBack }) => (
              <FormView
                key="interested"
                defaultValues={values}
                resolver={zodResolver(
                  z.object({
                    interested: z.string(),
                  })
                )}
                onNext={onNext}
              >
                <FormLayout
                  heading="Would you be interested in learning how to code?"
                  description="Having coding skills can be very beneficial"
                  fields={[
                    <Listbox
                      key="interested"
                      name="interested"
                      label="Interested"
                      options={[
                        {
                          value: "maybe",
                          label: "Maybe in another time.",
                        },
                        {
                          value: "yes",
                          label: "Yes, that sounds good.",
                        },
                        {
                          value: "no",
                          label: "No, it is not for me.",
                        },
                      ]}
                    />,
                  ]}
                  button={<Next>Next</Next>}
                  back={<Back onBack={onBack} />}
                />
              </FormView>
            ),
          },
        },
        {
          return: ({ name, surname, age, softwareDeveloper, interested }) => ({
            fullName: `${name} ${surname}`,
            age,
            softwareDeveloper,
            interested,
          }),
        },
      ],
    },
  },
];
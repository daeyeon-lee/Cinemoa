package io.ssafy.cinemoa.funding.repository.document;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.annotations.Setting;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Setting(replicas = 0)
@Document(indexName = "fundings")
public class FundingDocument {

    @Id
    private String id;

    @Field(type = FieldType.Long, index = false, docValues = false)
    private Long fundingId;

    @Field(type = FieldType.Text, analyzer = "nori")
    private String title;

    @Field(type = FieldType.Text, analyzer = "nori")
    private String videoName;
}
